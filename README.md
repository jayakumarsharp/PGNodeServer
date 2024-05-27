# Capstone-2 : Portfolio Manager (backend)

This is the landing page for the backend project. The frontend project is located at [pm-fronted](https://github.com/fan777/pm-frontend)

Demo @ https://unkempt-expansion.surge.sh/

---

## Table of Contents
- [1. About The Project](#about-the-project)
- [2. Objectives](#objectives)
- [3. Getting Started](#getting-started)
  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
- [4. Schema](#schema)
- [6. Data](#data)
- [8. Future Considerations](#future-considerations)


---

## About The Project

A portfolio manager to organize your invesments and determine whether your current allocations are in line with your targets. This project is the backend Node.js storing portfolio information and delivering stock data as API.

## Objectives

* Establish database, schema, and sample data for a stock portfolio
* Establish accessibility of backend portfolio information to frontend
* Establish API for frontend from external API for detailed stock information

## Getting Started
  * ### Prerequisites
    * PostgreSQL
    * NodeJS
    * Express
  
  * ### Installation
    * Clone repository
    * Run pm.sql (create database and load seed data)
    * npm to install dependencies

## Schema
  * Users table: contains username, password, email
  * Portfolios table: contains postfolio id, name, cash, notes for each user
  * Watchlist table: contains username and watched stock symbols
  * Holdings table: contains holding id, symbol, shares owned, etc for each portfolio

## Data
  * [node-yahoo-finance2](https://github.com/gadicc/node-yahoo-finance2)

## Future Considerations

The backend is based on another assignment and can be re-designed to better fit this application.