"use strict";

/** Routes for holdings. */

const jsonschema = require("jsonschema");
const express = require("express");
const { ensureLoggedIn, ensureCorrectHolding } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const Holding = require("../models/holding");

const holdingNewSchema = require("../schemas/holdingNew.json");
const holdingUpdateSchema = require("../schemas/holdingUpdate.json");

const router = new express.Router();

/** GET /[id] => { holding } 
 * 
 * Returns { id, symbol, shares_owned, cost_basis, target_percentage, goal, portfolio_id }
 * 
 * Authorization required: user must own holding
*/

router.get("/:id", ensureCorrectHolding, async function (req, res, next) {
  try {
    const holding = await Holding.get(req.params.id);
    return res.json({ holding });
  } catch (err) {
    return next(err);
  }
});

/** POST / { holding } => { holding } 
 * 
 * holding should be { symbol, shares_owned, cost_basis, target_percentage, goal, portfolio_id }
 * 
 * Returns { id, symbol, shares_owned, cost_basis, target_percentage, goal, portfolio_id }
 * 
 * Authorization required: logged in user
*/

router.post("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, holdingNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const holding = await Holding.create(req.body);
    return res.status(201).json({ holding });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[id] { fld1, fld2, ... } => { holding } 
 * 
 * Patches holding data.
 * 
 * fields can be: { shares_owned, cost_basis, target_percentage, goal }
 * 
 * Returns { id, symbol, shares_owned, cost_basis, target_percentage, goal, portfolio_id }
 * 
 * Authorizatio required: user must own holding
*/

router.patch("/:id", ensureCorrectHolding, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, holdingUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const holding = await Holding.update(req.params.id, req.body);
    return res.json({ holding });
  } catch (err) {
    return next(err);
  }
})

/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization: user must own portfolio
 */

router.delete("/:id", ensureCorrectHolding, async function (req, res, next) {
  try {
    await Holding.remove(req.params.id);
    return res.json({ deleted: +req.params.id });
  } catch (err) {
    return next(err);
  }
})

module.exports = router;