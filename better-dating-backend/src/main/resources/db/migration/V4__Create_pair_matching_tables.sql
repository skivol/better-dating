CREATE TABLE dating_pair
(
    first_profile_id        uuid         NOT NULL,
    second_profile_id       uuid         NOT NULL,
    goal                    varchar(64)  NOT NULL,
    when_matched            timestamp(0) NOT NULL,
    active                  bool         NOT NULL,
    first_profile_snapshot  json         NOT NULL,
    second_profile_snapshot json         NOT NULL,
    CONSTRAINT dating_pair_pk PRIMARY KEY (first_profile_id, second_profile_id, goal)
);

CREATE TABLE dating_pair_lock
(
    profile_id uuid NOT NULL,
    CONSTRAINT dating_pair_lock_pk PRIMARY KEY (profile_id),
    CONSTRAINT dating_pair_lock_fk FOREIGN KEY (profile_id) REFERENCES email (id)
);
