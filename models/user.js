"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const Portfolio = require("./portfolio");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

/** Related functions for users. */

class User {
  /** authenticate user with username, password.
   *
   * Returns { username, email }
   *
   * Throws UnauthorizedError is user not found or wrong password.
   **/

  static async authenticate(username, password) {
    // try to find the user first
    const result = await db.query(
      `SELECT username,
                  password,
                  email
           FROM users
           WHERE username = $1`,
      [username],
    );

    const user = result.rows[0];

    if (user) {
      // compare hashed password to a new hash from password
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid username/password");
  }

  /** Register user with data.
   *
   * Returns { username, email}
   *
   * Throws BadRequestError on duplicates.
   **/

  static async register(
    { username, password, email }) {
    const duplicateCheck = await db.query(
      `SELECT username
           FROM users
           WHERE username = $1`,
      [username],
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate username: ${username}`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `INSERT INTO users
           (username,
            password,
            email)
           VALUES ($1, $2, $3)
           RETURNING username, email`,
      [
        username,
        hashedPassword,
        email,
      ],
    );

    const user = result.rows[0];

    return user;
  }

  /** Find all users.
   *
   * Returns [{ username, email }, ...]
   **/

  static async findAll() {
    const result = await db.query(
      `SELECT username,
                  email
           FROM users
           ORDER BY username`,
    );

    return result.rows;
  }

  /** Given a username, return data about user.
   *
   * Returns { username, email }
   *
   * Throws NotFoundError if user not found.
   **/

  static async get(username) {
    const userRes = await db.query(
      `SELECT username,
                  email
           FROM users
           WHERE username = $1`,
      [username],
    );

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    const watchlistRes = await db.query(
      `SELECT symbol
       FROM watchlist
       WHERE username = $1`,
      [username]);

    const watchlist = watchlistRes.rows.map(a => a.symbol);

    user.watchlist = watchlist;

    return user;
  }

  /** Given a username, return all data about user.
   *
   * Returns { username, email, portfolios }
   *   where portfolios is [{ id, name, cash, notes, username, holdings }, ...]
   *   where holdings is [{ id, symbol, shares_owned, cost_basis, target_percentage, goal, portfolio_id }, ...]
   *
   * Throws NotFoundError if user not found.
   **/

  static async getComplete(username) {
    const userRes = await db.query(
      `SELECT username,
                  email
           FROM users
           WHERE username = $1`,
      [username]);

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    const watchlistRes = await db.query(
      `SELECT symbol
       FROM watchlist
       WHERE username = $1`,
      [username]);

    const watchlist = watchlistRes.rows.map(a => a.symbol);

    user.watchlist = watchlist;

    try {
      const portfolioIds = await this.getUserPortfolioIds(username);
      user.portfolios = await Promise.all(portfolioIds.map(async (id) => Portfolio.get(id)));
    } catch (err) {
      throw new BadRequestError(err);
    }

    return user;
  }

  /** Update user data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { password, email }
   *
   * Returns { username, email }
   *
   * Throws NotFoundError if not found.
   *
   * WARNING: this function can set a new password or make a user an admin.
   * Callers of this function must be certain they have validated inputs to this
   * or a serious security risks are opened.
   */

  static async update(username, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }

    const { setCols, values } = sqlForPartialUpdate(
      data,
      {});
    const usernameVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE users 
                      SET ${setCols} 
                      WHERE username = ${usernameVarIdx} 
                      RETURNING username,
                                email`;
    const result = await db.query(querySql, [...values, username]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    delete user.password;
    return user;
  }

  /** Delete given user from database; returns undefined. */

  static async remove(username) {
    let result = await db.query(
      `DELETE
           FROM users
           WHERE username = $1
           RETURNING username`,
      [username],
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);
  }

  /** Add stock to watchlist: update db, returns undefined.
   * 
   * - username: username watching stock
   * - symbol: stock symbol
   */

  static async addToWatchlist(username, symbol) {
    const preCheck = await db.query(
      `SELECT username
       FROM users
       WHERE username = $1`, [username]);
    const user = preCheck.rows[0];

    if (!user) throw new NotFoundError(`No username: ${username}`);

    const duplicateCheck = await db.query(
      `SELECT username, symbol
       FROM watchlist
       WHERE username = $1 AND symbol = $2`,
      [username, symbol]);

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Symbol ${symbol} already watched by user ${username}`);
    }

    await db.query(`INSERT INTO watchlist (username, symbol)
                    VALUES ($1, $2)`,
      [username, symbol]);
  }

  /** Remove stock from watchlist: update db, returns undefined.
   * 
   * - username: username watching stock
   * - symbol: stock symbol
   */

  static async removeFromWatchlist(username, symbol) {
    const preCheck = await db.query(
      `SELECT username
       FROM users
       WHERE username = $1`, [username]);
    const user = preCheck.rows[0];

    if (!user) throw new NotFoundError(`No username: ${username}`);

    const duplicateCheck = await db.query(
      `SELECT username, symbol
       FROM watchlist
       WHERE username = $1 AND symbol = $2`,
      [username, symbol]);

    if (duplicateCheck.rows.length < 1) {
      throw new BadRequestError(`Symbol ${symbol} not watched by user ${username}`);
    }

    await db.query(`DELETE FROM watchlist
                    WHERE username = $1 AND symbol = $2`,
      [username, symbol]);
  }

  /** Given username, return portfolio ids
   * 
   * Returns [...portfolioIds]
   */

  static async getUserPortfolioIds(username) {
    const result = await db.query(
      `SELECT id
       FROM portfolios
       WHERE username = $1`,
      [username]);
    const portfolioIds = result.rows.map(a => a.id);
    return portfolioIds;
  }

  /** Given username, return holding ids
   *
   * Returns [...holdingIds]
   */

  static async getUserHoldingIds(username) {
    const result = await db.query(
      `SELECT a.id 
       FROM holdings a
       JOIN portfolios b
       ON a.portfolio_id = b.id
       WHERE b.username = $1`,
      [username]);
    const holdingIds = result.rows.map(a => a.id);
    return holdingIds;
  }
}

module.exports = User;
