-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.admin (
  num_tel character varying NOT NULL,
  nom_complet character varying,
  email character varying UNIQUE CHECK (email::text ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'::text),
  mdp character varying,
  type character varying CHECK (type::text = ANY (ARRAY['Admin'::character varying, 'AdminChauffeur'::character varying, 'AdminStatistique'::character varying, 'AdminReclamations'::character varying, 'AdminGestion'::character varying]::text[])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admin_pkey PRIMARY KEY (num_tel)
);
CREATE TABLE public.admin_modification_logs (
  id integer NOT NULL DEFAULT nextval('admin_modification_logs_id_seq'::regclass),
  table_name character varying NOT NULL,
  record_id character varying NOT NULL,
  action character varying NOT NULL DEFAULT 'UPDATE'::character varying,
  modified_by character varying,
  modification_date timestamp with time zone NOT NULL DEFAULT now(),
  field_changed character varying,
  old_value text,
  new_value text,
  CONSTRAINT admin_modification_logs_pkey PRIMARY KEY (id),
  CONSTRAINT admin_modification_logs_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.admin(num_tel)
);
CREATE TABLE public.announcements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  image_url text,
  type text NOT NULL CHECK (type = ANY (ARRAY['info'::text, 'warning'::text, 'promotion'::text, 'update'::text])),
  is_active boolean DEFAULT true,
  start_date timestamp with time zone NOT NULL DEFAULT now(),
  end_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT announcements_pkey PRIMARY KEY (id)
);
CREATE TABLE public.applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text NOT NULL,
  city text NOT NULL,
  motorcycle_type text NOT NULL,
  experience text NOT NULL,
  phone_verified boolean DEFAULT false,
  status text DEFAULT 'pending'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT applications_pkey PRIMARY KEY (id)
);
CREATE TABLE public.avis (
  id integer NOT NULL DEFAULT nextval('avis_id_seq'::regclass),
  id_client character varying NOT NULL,
  id_motard character varying NOT NULL,
  id_course uuid NOT NULL,
  note numeric NOT NULL CHECK (note >= 0::numeric AND note <= 5::numeric),
  avis_textuel text CHECK (length(avis_textuel) <= 1000),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT avis_pkey PRIMARY KEY (id),
  CONSTRAINT avis_id_client_fkey FOREIGN KEY (id_client) REFERENCES public.client(num_tel),
  CONSTRAINT avis_id_motard_fkey FOREIGN KEY (id_motard) REFERENCES public.motard(num_tel),
  CONSTRAINT avis_id_course_fkey FOREIGN KEY (id_course) REFERENCES public.course(id)
);
CREATE TABLE public.client (
  num_tel character varying NOT NULL CHECK (num_tel IS NOT NULL AND length(TRIM(BOTH FROM num_tel)) > 0),
  nom_complet character varying,
  status_bloque boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  user_id uuid,
  fcm_token text,
  CONSTRAINT client_pkey PRIMARY KEY (num_tel),
  CONSTRAINT client_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.client_locations (
  id integer NOT NULL DEFAULT nextval('client_locations_id_seq'::regclass),
  client_id character varying NOT NULL UNIQUE,
  location text NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT client_locations_pkey PRIMARY KEY (id),
  CONSTRAINT client_locations_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.client(num_tel)
);
CREATE TABLE public.course (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  id_client character varying NOT NULL,
  id_motard character varying,
  point_depart character varying NOT NULL,
  point_arrivee character varying NOT NULL,
  depart_latitude numeric,
  depart_longitude numeric,
  arrivee_latitude numeric,
  arrivee_longitude numeric,
  date_heure timestamp with time zone NOT NULL,
  date_acceptation timestamp with time zone,
  heure_fin timestamp with time zone,
  etat character varying NOT NULL CHECK (etat::text = ANY (ARRAY['réservée'::character varying, 'annulée'::character varying, 'en_cours'::character varying, 'completée'::character varying]::text[])),
  prix numeric NOT NULL,
  distance_km numeric,
  duree_minutes integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT course_pkey PRIMARY KEY (id),
  CONSTRAINT course_id_client_fkey FOREIGN KEY (id_client) REFERENCES public.client(num_tel),
  CONSTRAINT course_id_motard_fkey FOREIGN KEY (id_motard) REFERENCES public.motard(num_tel)
);
CREATE TABLE public.motard (
  num_tel character varying NOT NULL,
  nom_complet character varying,
  statut_bloque boolean DEFAULT false,
  matricule_moto character varying,
  date_naiss date,
  permis_cond text,
  is_online boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  fcm_token text,
  modified_by character varying,
  wallet_balance numeric NOT NULL DEFAULT 0,
  CONSTRAINT motard_pkey PRIMARY KEY (num_tel),
  CONSTRAINT motard_matricule_moto_fkey FOREIGN KEY (matricule_moto) REFERENCES public.moto(matricule),
  CONSTRAINT motard_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.admin(num_tel)
);
CREATE TABLE public.motard_locations (
  id integer NOT NULL DEFAULT nextval('motard_locations_id_seq'::regclass),
  motard_id character varying NOT NULL UNIQUE,
  location text NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT motard_locations_pkey PRIMARY KEY (id),
  CONSTRAINT motard_locations_motard_id_fkey FOREIGN KEY (motard_id) REFERENCES public.motard(num_tel)
);
CREATE TABLE public.moto (
  matricule character varying NOT NULL,
  modele character varying,
  couleur USER-DEFINED,
  type character varying,
  carte_grise text,
  photo_moto text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT moto_pkey PRIMARY KEY (matricule)
);
CREATE TABLE public.notification_history (
  id integer NOT NULL DEFAULT nextval('notification_history_id_seq'::regclass),
  sender_phone character varying NOT NULL,
  receiver_phone character varying NOT NULL,
  receiver_type character varying NOT NULL CHECK (receiver_type::text = ANY (ARRAY['motard'::character varying, 'client'::character varying]::text[])),
  title text NOT NULL,
  body text NOT NULL,
  status character varying DEFAULT 'sent'::character varying CHECK (status::text = ANY (ARRAY['sent'::character varying, 'delivered'::character varying, 'failed'::character varying]::text[])),
  fcm_response text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notification_history_pkey PRIMARY KEY (id)
);
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  driver_phone character varying NOT NULL,
  chargily_checkout_id character varying UNIQUE,
  amount numeric NOT NULL,
  currency character varying DEFAULT 'DZD'::character varying,
  status character varying NOT NULL DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'paid'::character varying, 'failed'::character varying, 'expired'::character varying]::text[])),
  payment_method character varying,
  checkout_url text,
  webhook_received_at timestamp with time zone,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_driver_phone_fkey FOREIGN KEY (driver_phone) REFERENCES public.motard(num_tel)
);
CREATE TABLE public.platform_settings (
  key character varying NOT NULL,
  value character varying NOT NULL,
  description text,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT platform_settings_pkey PRIMARY KEY (key)
);
CREATE TABLE public.reclamation (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  client_phone character varying,
  motard_phone character varying,
  course_id uuid,
  type USER-DEFINED NOT NULL DEFAULT 'autre'::reclamation_type,
  priority USER-DEFINED NOT NULL DEFAULT 'moyenne'::reclamation_priority,
  status USER-DEFINED NOT NULL DEFAULT 'ouverte'::reclamation_status,
  sujet character varying NOT NULL,
  description text NOT NULL,
  admin_response text,
  assigned_to character varying,
  resolved_by character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  resolved_at timestamp with time zone,
  CONSTRAINT reclamation_pkey PRIMARY KEY (id),
  CONSTRAINT reclamation_client_phone_fkey FOREIGN KEY (client_phone) REFERENCES public.client(num_tel),
  CONSTRAINT reclamation_motard_phone_fkey FOREIGN KEY (motard_phone) REFERENCES public.motard(num_tel),
  CONSTRAINT reclamation_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.course(id),
  CONSTRAINT reclamation_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.admin(num_tel),
  CONSTRAINT reclamation_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES public.admin(num_tel)
);
CREATE TABLE public.ride_rejections (
  id integer NOT NULL DEFAULT nextval('ride_rejections_id_seq'::regclass),
  ride_id uuid NOT NULL,
  driver_phone character varying NOT NULL,
  rejected_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ride_rejections_pkey PRIMARY KEY (id),
  CONSTRAINT ride_rejections_ride_id_fkey FOREIGN KEY (ride_id) REFERENCES public.course(id),
  CONSTRAINT ride_rejections_driver_phone_fkey FOREIGN KEY (driver_phone) REFERENCES public.motard(num_tel)
);
CREATE TABLE public.spatial_ref_sys (
  srid integer NOT NULL CHECK (srid > 0 AND srid <= 998999),
  auth_name character varying,
  auth_srid integer,
  srtext character varying,
  proj4text character varying,
  CONSTRAINT spatial_ref_sys_pkey PRIMARY KEY (srid)
);
CREATE TABLE public.wallet_transactions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  driver_phone character varying NOT NULL,
  type character varying NOT NULL CHECK (type::text = ANY (ARRAY['topup'::character varying, 'fee_deduction'::character varying, 'refund'::character varying, 'bonus'::character varying]::text[])),
  amount numeric NOT NULL,
  balance_before numeric NOT NULL,
  balance_after numeric NOT NULL,
  description text,
  reference_id character varying,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT wallet_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT wallet_transactions_driver_phone_fkey FOREIGN KEY (driver_phone) REFERENCES public.motard(num_tel)
);