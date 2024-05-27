"use strict";

/** Routes for portfolios. */

const jsonschema = require("jsonschema");
const express = require("express");
const { ensureLoggedIn, ensureCorrectPortfolio } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const Portfolio = require("../models/portfolio");

const portfolioNewSchema = require("../schemas/portfolioNew.json");
const portfolioUpdateSchema = require("../schemas/portfolioUpdate.json");

const router = new express.Router();

/** GET /[id] => { portfolio }
 * 
 * Returns { id, name, cash, notes, username, holdings }
 *   where where holdings is [{ id, symbol, shares_owned, cost_basis, target_percentage, goal, portfolio_id }, ...]
 * 
 * Authorization required: user must own portfolio
*/

router.get("/:id", ensureCorrectPortfolio, async function (req, res, next) {
  try {
    const portfolio = await Portfolio.get(req.params.id);
    return res.json({ portfolio });
  } catch (err) {
    return next(err);
  }
});

/** POST / { portfolio } => { portfolio }
 * 
 * portfolio should be { name, cash, notes, username }
 * 
 * Returns { id, name, cash, notes, username }
 * 
 * Authorization required: logged in user
*/

router.post("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, portfolioNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const portfolio = await Portfolio.create(req.body);
    return res.status(201).json({ portfolio });
  } catch (err) {
    return next(err);
  }
})

/** PATCH /[id] { fld1, fld2, ... } => { portfolio }
 *
 * Patches portfolio data.
 *
 * fields can be: { name, cash, notes, username }
 *
 * Returns { id, name, cash, notes, username }
 *
 * Authorization required: user must own portfolio
 */

router.patch("/:id", ensureCorrectPortfolio, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, portfolioUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const portfolio = await Portfolio.update(req.params.id, req.body, res.locals.user.username);
    return res.json({ portfolio });
  } catch (err) {
    return next(err);
  }
})

/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization: user must own portfolio
 */

router.delete("/:id", ensureCorrectPortfolio, async function (req, res, next) {
  try {
    await Portfolio.remove(req.params.id);
    return res.json({ deleted: +req.params.id });
  } catch (err) {
    return next(err);
  }
})


module.exports = router;