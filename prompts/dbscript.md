create table users (
 id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),

  first_name text,
  last_name text,
  name text,
  mobile text,
  email text,

  created_by uuid null,
  updated_by uuid null,
  created_on timestamptz null,
  updated_on timestamptz null,
  user_ip inet null
);
create table main_categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id),
  name text,
  slug text,
  order_index int,

  created_by uuid null,
  updated_by uuid null,
  created_on timestamptz null,
  updated_on timestamptz null,
  user_ip inet null
);
create table categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id),
  main_category_id uuid references main_categories(id),
  name text,
  slug text,

  created_by uuid null,
  updated_by uuid null,
  created_on timestamptz null,
  updated_on timestamptz null,
  user_ip inet null
);
create table sub_categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id),
  category_id uuid references categories(id),
  name text,
  slug text,

  created_by uuid null,
  updated_by uuid null,
  created_on timestamptz null,
  updated_on timestamptz null,
  user_ip inet null
);
create table sub_sub_categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id),
  sub_category_id uuid references sub_categories(id),
  name text,
  slug text,

  created_by uuid null,
  updated_by uuid null,
  created_on timestamptz null,
  updated_on timestamptz null,
  user_ip inet null
);
create table products (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id),

  sub_category_id uuid references sub_categories(id),
  sub_sub_category_id uuid references sub_sub_categories(id),

  name text,
  description text,
  price numeric(10,2),
  stock int,
  is_active boolean default true,

  created_by uuid null,
  updated_by uuid null,
  created_on timestamptz null,
  updated_on timestamptz null,
  user_ip inet null
);
create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id),
  image_url text,

  created_by uuid null,
  updated_by uuid null,
  created_on timestamptz null,
  updated_on timestamptz null,
  user_ip inet null
);
create table carts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id),
  user_id uuid references users(id),

  created_by uuid null,
  updated_by uuid null,
  created_on timestamptz null,
  updated_on timestamptz null,
  user_ip inet null
);
create table cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid references carts(id),
  product_id uuid references products(id),
  quantity int,

  created_by uuid null,
  updated_by uuid null,
  created_on timestamptz null,
  updated_on timestamptz null,
  user_ip inet null
);
create table orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id),
  user_id uuid references users(id),

  status text,
  delivery_date date,
  reusable_bag boolean default false,

  created_by uuid null,
  updated_by uuid null,
  created_on timestamptz null,
  updated_on timestamptz null,
  user_ip inet null
);
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id),
  product_id uuid references products(id),
  quantity int,
  price numeric(10,2),

  created_by uuid null,
  updated_by uuid null,
  created_on timestamptz null,
  updated_on timestamptz null,
  user_ip inet null
);
create table addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  city text,
  area text,
  address_details text,

  created_by uuid null,
  updated_by uuid null,
  created_on timestamptz null,
  updated_on timestamptz null,
  user_ip inet null
);
create table delivery_slots (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id),
  slot_time text,

  created_by uuid null,
  updated_by uuid null,
  created_on timestamptz null,
  updated_on timestamptz null,
  user_ip inet null
);
create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id),
  method text,
  status text,
  amount numeric(10,2),
  paid_at timestamptz,

  created_by uuid null,
  updated_by uuid null,
  created_on timestamptz null,
  updated_on timestamptz null,
  user_ip inet null
);
create table subscription_plans (
  id uuid primary key default gen_random_uuid(),
  name text,
  price numeric,
  duration_days int,

  created_by uuid null,
  updated_by uuid null,
  created_on timestamptz null,
  updated_on timestamptz null,
  user_ip inet null
);
create table tenant_subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id),
  plan_id uuid references subscription_plans(id),

  start_date date,
  end_date date,
  is_active boolean,

  created_by uuid null,
  updated_by uuid null,
  created_on timestamptz null,
  updated_on timestamptz null,
  user_ip inet null
);
