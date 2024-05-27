\echo 'Delete and recreate pm db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE pm;
CREATE DATABASE pm;
\connect pm

\i pm-schema.sql
\i pm-seed.sql

\echo 'Delete and recreate pm_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE pm_test;
CREATE DATABASE pm_test;
\connect pm_test

\i pm-schema.sql
\i pm-seed.sql