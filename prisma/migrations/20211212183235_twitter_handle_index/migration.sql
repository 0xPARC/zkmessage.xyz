CREATE EXTENSION pg_trgm;
CREATE INDEX twitter_handle_index ON "User" USING GIN ("twitterHandle" gin_trgm_ops);