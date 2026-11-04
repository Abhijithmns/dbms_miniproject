# SQL evaluation scripts

These scripts target the schema in `dbms_miniproject.sql`:

- `evaluation_6_dml.sql` demonstrates transactional INSERT, UPDATE, SELECT, and safe DELETE.
- `evaluation_7_queries.sql` demonstrates joins, nested queries, correlated subqueries, and a recursive CTE for comment trees.
- `evaluation_8_advanced.sql` demonstrates a function, procedure, triggers, and a windowed CTE.
- `seed_demo.sql` adds safe demo users, subgetits, posts, comments, votes, awards, and a message for Docker.

Run them with the MariaDB client:

```bash
mariadb -u abhijith -p dbms_miniproject < sql/evaluation_6_dml.sql
mariadb -u abhijith -p dbms_miniproject < sql/evaluation_7_queries.sql
mariadb -u abhijith -p dbms_miniproject < sql/evaluation_8_advanced.sql
```

The DML script uses a clearly named demo row and removes only that row at the end. Review it before running against a production database.
