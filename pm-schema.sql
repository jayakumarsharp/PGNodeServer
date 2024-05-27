CREATE TABLE users (
  username VARCHAR(25) PRIMARY KEY,
  password TEXT NOT NULL,
  email TEXT NOT NULL
    CHECK (position('@' IN email) > 1)
);

CREATE TABLE portfolios (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  cash NUMERIC(22,2)  DEFAULT '0.00' NOT NULL,
  notes TEXT,
  username VARCHAR(25) 
    REFERENCES users ON DELETE CASCADE
);

CREATE TABLE holdings (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(25) NOT NULL,
  shares_owned DECIMAL,
  cost_basis NUMERIC(22,2) ,
  target_percentage DECIMAL,
  goal TEXT,
  portfolio_id INTEGER
    REFERENCES portfolios ON DELETE CASCADE
);

CREATE TABLE watchlist (
  username VARCHAR(25)
    REFERENCES users ON DELETE CASCADE,
  symbol VARCHAR(25) NOT NULL, 
  PRIMARY KEY (username, symbol)
)