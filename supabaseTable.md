-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.Items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  category text,
  available boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  slug text,
  CONSTRAINT Items_pkey PRIMARY KEY (id)
);
CREATE TABLE public.discount_coupons (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reward_rule_id uuid NOT NULL,
  code text NOT NULL UNIQUE,
  discount_percent numeric NOT NULL,
  status text NOT NULL DEFAULT 'active'::text,
  created_at timestamp without time zone DEFAULT now(),
  expires_at timestamp without time zone,
  CONSTRAINT discount_coupons_pkey PRIMARY KEY (id),
  CONSTRAINT discount_coupons_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT discount_coupons_reward_rule_id_fkey FOREIGN KEY (reward_rule_id) REFERENCES public.reward_rules(id)
);
CREATE TABLE public.live_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  items jsonb,
  total_amount numeric,
  status text DEFAULT 'pending'::text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT live_orders_pkey PRIMARY KEY (id),
  CONSTRAINT live_orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.loyalty_rewards (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  item_slug text NOT NULL,
  purchase_count integer NOT NULL DEFAULT 0,
  reward_rule_id uuid,
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT loyalty_rewards_pkey PRIMARY KEY (id),
  CONSTRAINT loyalty_rewards_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT loyalty_rewards_reward_rule_id_fkey FOREIGN KEY (reward_rule_id) REFERENCES public.reward_rules(id)
);
CREATE TABLE public.order_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  items jsonb NOT NULL,
  total_amount numeric NOT NULL,
  status character varying DEFAULT 'pending'::character varying,
  payment_status character varying DEFAULT 'unpaid'::character varying,
  transaction_id character varying,
  token_number integer NOT NULL DEFAULT nextval('order_history_token_number_seq'::regclass) UNIQUE,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT order_history_pkey PRIMARY KEY (id),
  CONSTRAINT order_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  full_name text,
  phone text,
  role text NOT NULL DEFAULT 'user'::text,
  created_at timestamp with time zone DEFAULT now(),
  email text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.reward_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  item_slug text NOT NULL,
  required_purchases integer NOT NULL,
  discount_percent numeric NOT NULL,
  description text,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reward_rules_pkey PRIMARY KEY (id)
);