INSERT INTO users(username, password, email)
VALUES ('cfan',
        '$2a$04$NiGgd8f2Y1b/EbhUpF1Ca.PvX1PdU.hgF0cO0mYm1t5egkVvUxQjm',
        'cfan@test.com'),
       ('test',
        '$2a$04$NiGgd8f2Y1b/EbhUpF1Ca.PvX1PdU.hgF0cO0mYm1t5egkVvUxQjm',
        'test@test.com');

INSERT INTO portfolios (name, cash, notes, username)
VALUES ('active',1787.95,'','cfan'),
       ('stable',10.62,'','cfan'),
       ('test',0,'test notes','test');
       ('test2',200.12,'more notes','test');
       ('test3',123.45,'more notes2','test');

INSERT INTO holdings (symbol, shares_owned, cost_basis, target_percentage, goal, portfolio_id)
VALUES ('ALLY', 20, 988.70, 0.1, 'HOLD', 1),
       ('EJFAW', 300, 566.90, 0, 'SELL AT 3 - 5', 1),
       ('INTC', 20, 1090.89, 0.1, 'HOLD', 1),
       ('SOFI', 250, 5244.56, 0.55, 'HOLD', 1),
       ('VTI', 0, 0, 0.25, 'BUY', 1),
       ('VTI', 123.3962, 18626.94, 0.4, 'HOLD', 2),
       ('VTV', 50.2929, 6381.13, 0.1, 'HOLD', 2),
       ('VUG', 25.027, 6557.55, 0.1, 'HOLD', 2),
       ('VXF', 73.1059, 11255.15, 0.2, 'HOLD', 2),
       ('VXUS', 206.0241, 12117.98, 0.2, 'HOLD', 2),
       ('QQQ', 10, 1000, 0.50, 'HOLD', 3),
       ('AAPL', 0, 0, 0.25, 'BUY', 3),
       ('TSLA', 1, 0, 0.25, 'BUY', 3);
       ('M', 5, 0, 0.25, 'BUY', 4);
       ('VISA', 15, 0, 0.25, 'BUY', 3);

INSERT INTO watchlist (username, symbol)
VALUES ('cfan','AMD'),
       ('test', 'AMD'),
       ('test', 'NVDA');