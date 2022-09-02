-- Table: public.employees

-- DROP TABLE IF EXISTS public.employees;

CREATE TABLE IF NOT EXISTS public.employees
(
    id character varying(50) COLLATE pg_catalog."default" NOT NULL,
    firstname character varying(100) COLLATE pg_catalog."default",
    lastname character varying(100) COLLATE pg_catalog."default",
    country character varying(100) COLLATE pg_catalog."default",
    email character varying(100) COLLATE pg_catalog."default",
    manager_id character varying(50) COLLATE pg_catalog."default",
    CONSTRAINT employees_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

-- Table: public.employees_skills

-- DROP TABLE IF EXISTS public.employees_skills;

CREATE TABLE IF NOT EXISTS public.employees_skills
(
    employee_id character varying(50) COLLATE pg_catalog."default",
    skill_id uuid,
    entry_uuid uuid NOT NULL,
    skill_level integer,
    created_at character varying(255) COLLATE pg_catalog."default",
    updated_at character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT employees_skills_pkey PRIMARY KEY (entry_uuid),
    CONSTRAINT employees_skills_employee_id_fkey FOREIGN KEY (employee_id)
        REFERENCES public.employees (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT employees_skills_skill_id_fkey FOREIGN KEY (skill_id)
        REFERENCES public.skills (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT skill_level_number CHECK (skill_level > 0 AND skill_level < 4) NOT VALID
)

TABLESPACE pg_default;

-- Table: public.evidence

-- DROP TABLE IF EXISTS public.evidence;

CREATE TABLE IF NOT EXISTS public.evidence
(
    evidence_url text COLLATE pg_catalog."default",
    description text COLLATE pg_catalog."default",
    emp_skill_id uuid NOT NULL,
    id uuid NOT NULL,
    created_at character varying(255) COLLATE pg_catalog."default",
    updated_at character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT evidence_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

-- Table: public.skill_levels

-- DROP TABLE IF EXISTS public.skill_levels;

CREATE TABLE IF NOT EXISTS public.skill_levels
(
    id integer NOT NULL DEFAULT nextval('skill_levels_id_seq'::regclass),
    competency_type character varying(50) COLLATE pg_catalog."default" NOT NULL,
    lvl_1 character varying(50) COLLATE pg_catalog."default",
    lvl_2 character varying(50) COLLATE pg_catalog."default",
    lvl_3 character varying(50) COLLATE pg_catalog."default",
    CONSTRAINT skill_levels_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;


-- Table: public.skills

-- DROP TABLE IF EXISTS public.skills;

CREATE TABLE IF NOT EXISTS public.skills
(
    id uuid NOT NULL,
    skill_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default",
    category text COLLATE pg_catalog."default",
    is_certification boolean,
    skill_levels integer,
    CONSTRAINT skills_pkey PRIMARY KEY (id),
    CONSTRAINT skill_levels_id FOREIGN KEY (skill_levels)
        REFERENCES public.skill_levels (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

TABLESPACE pg_default;