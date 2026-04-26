SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict kCynOTjBQSYldRRrPAXcgGbX9HKGZdPcXDToiwynG7hNQ9OfwKU6n1Ml6zPXq1k

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '240d4a78-1c3a-4a8f-be1d-7e889398178d', 'authenticated', 'authenticated', 'dog619@gmail.com', '$2a$10$O1b/C/IL3p6cy1sLVCToAuHNa4xQO3u1MVuZljW8llIB73jKNdWTK', '2026-04-18 05:27:32.741103+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-04-18 05:35:52.898442+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "240d4a78-1c3a-4a8f-be1d-7e889398178d", "email": "dog619@gmail.com", "display_name": "狗頭", "email_verified": true, "phone_verified": false}', NULL, '2026-04-18 05:27:32.733373+00', '2026-04-18 09:52:21.939635+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '187fc7ee-869d-441b-949f-a9e92fec07f6', 'authenticated', 'authenticated', 'kidd91.chen@gmail.com', '$2a$10$l9.bvGkHV.rTNwH.8mLQPOtEIwSHkvpm0XO19wW7SdI/Wpd.315hK', '2026-04-18 05:14:43.710565+00', NULL, '', '2026-04-18 05:14:27.650209+00', '', NULL, '', '', NULL, '2026-04-19 05:06:02.908503+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "187fc7ee-869d-441b-949f-a9e92fec07f6", "email": "kidd91.chen@gmail.com", "display_name": "KIDD", "email_verified": true, "phone_verified": false}', NULL, '2026-04-18 05:14:27.628127+00', '2026-04-19 08:45:26.326611+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '27728170-0da6-4a27-8351-3ab7291afa57', 'authenticated', 'authenticated', 'test@gmail.com', '$2a$10$8qp2ffbB57SFIgGQNK5yS.OhJ/PqOYQT5CChYIRbtrysCoAxmMSsm', '2026-04-19 11:56:33.0805+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-04-23 10:41:36.221829+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "27728170-0da6-4a27-8351-3ab7291afa57", "email": "test@gmail.com", "display_name": "C8", "email_verified": true, "phone_verified": false}', NULL, '2026-04-19 11:56:33.05353+00', '2026-04-24 06:02:08.259715+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', 'authenticated', 'authenticated', 'dog87@gmail.com', '$2a$10$obhiKr9KwHELhUe7xl958eQ5t0V40bUIQFnc3xXSudlGHpGPUDvh2', '2026-04-18 05:24:36.362494+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-04-24 06:06:34.919837+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "c3e53c0a-c93a-4ea0-99e8-307d232ec1ae", "email": "dog87@gmail.com", "display_name": "小狗汪汪", "email_verified": true, "phone_verified": false}', NULL, '2026-04-18 05:24:36.339551+00', '2026-04-26 03:43:09.015973+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('187fc7ee-869d-441b-949f-a9e92fec07f6', '187fc7ee-869d-441b-949f-a9e92fec07f6', '{"sub": "187fc7ee-869d-441b-949f-a9e92fec07f6", "email": "kidd91.chen@gmail.com", "display_name": "KIDD", "email_verified": true, "phone_verified": false}', 'email', '2026-04-18 05:14:27.644295+00', '2026-04-18 05:14:27.644347+00', '2026-04-18 05:14:27.644347+00', 'dd392c03-5866-4456-af06-3d21308be829'),
	('c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', '{"sub": "c3e53c0a-c93a-4ea0-99e8-307d232ec1ae", "email": "dog87@gmail.com", "display_name": "小狗汪汪", "email_verified": false, "phone_verified": false}', 'email', '2026-04-18 05:24:36.354823+00', '2026-04-18 05:24:36.354869+00', '2026-04-18 05:24:36.354869+00', '2f77e7d5-74c7-42a2-af02-ddf154e609f0'),
	('240d4a78-1c3a-4a8f-be1d-7e889398178d', '240d4a78-1c3a-4a8f-be1d-7e889398178d', '{"sub": "240d4a78-1c3a-4a8f-be1d-7e889398178d", "email": "dog619@gmail.com", "display_name": "狗頭", "email_verified": false, "phone_verified": false}', 'email', '2026-04-18 05:27:32.738379+00', '2026-04-18 05:27:32.738424+00', '2026-04-18 05:27:32.738424+00', 'eaf586ac-1019-4033-9c52-228be2cfd067'),
	('27728170-0da6-4a27-8351-3ab7291afa57', '27728170-0da6-4a27-8351-3ab7291afa57', '{"sub": "27728170-0da6-4a27-8351-3ab7291afa57", "email": "test@gmail.com", "display_name": "C8", "email_verified": false, "phone_verified": false}', 'email', '2026-04-19 11:56:33.075944+00', '2026-04-19 11:56:33.075989+00', '2026-04-19 11:56:33.075989+00', 'f7998e14-5b26-40b1-afef-2ac04917355c');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES
	('473f0cd5-de91-4e93-84d3-2f67210d3f70', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', '2026-04-19 13:55:02.094724+00', '2026-04-24 07:28:10.090706+00', NULL, 'aal1', NULL, '2026-04-24 07:28:10.090615', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '114.24.65.94', NULL, NULL, NULL, NULL, NULL),
	('89847b93-d6e5-4c4c-89b3-04c3dd385f85', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', '2026-04-24 06:06:34.919988+00', '2026-04-26 03:43:09.030028+00', NULL, 'aal1', NULL, '2026-04-26 03:43:09.029906', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '114.24.106.191', NULL, NULL, NULL, NULL, NULL),
	('9853029c-9678-4959-bebb-e831724deccf', '240d4a78-1c3a-4a8f-be1d-7e889398178d', '2026-04-18 05:27:32.744238+00', '2026-04-18 05:27:32.744238+00', NULL, 'aal1', NULL, NULL, 'node', '74.220.48.202', NULL, NULL, NULL, NULL, NULL),
	('fd041896-5c18-47ad-97ea-d56ff9eee7a3', '240d4a78-1c3a-4a8f-be1d-7e889398178d', '2026-04-18 05:27:54.698401+00', '2026-04-18 05:27:54.698401+00', NULL, 'aal1', NULL, NULL, 'node', '74.220.48.202', NULL, NULL, NULL, NULL, NULL),
	('127cf99e-f084-40c1-b0fa-c00034008b7c', '27728170-0da6-4a27-8351-3ab7291afa57', '2026-04-23 10:41:36.221962+00', '2026-04-24 06:02:08.269659+00', NULL, 'aal1', NULL, '2026-04-24 06:02:08.269567', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '114.24.65.94', NULL, NULL, NULL, NULL, NULL),
	('a80399d1-90b5-4467-a621-96d3c0b6a001', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', '2026-04-23 01:01:17.575836+00', '2026-04-24 06:05:00.396259+00', NULL, 'aal1', NULL, '2026-04-24 06:05:00.396154', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '114.24.65.94', NULL, NULL, NULL, NULL, NULL),
	('0aa8b1f7-03a9-4def-bd3a-bc16652a52c6', '240d4a78-1c3a-4a8f-be1d-7e889398178d', '2026-04-18 05:35:52.900329+00', '2026-04-18 09:52:21.94982+00', NULL, 'aal1', NULL, '2026-04-18 09:52:21.949726', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.4 Mobile/15E148 Safari/604.1', '114.24.100.139', NULL, NULL, NULL, NULL, NULL),
	('9034bec5-e746-4f7b-b32e-01b0a66a57e0', '27728170-0da6-4a27-8351-3ab7291afa57', '2026-04-20 04:23:07.678265+00', '2026-04-20 04:23:07.678265+00', NULL, 'aal1', NULL, NULL, 'node', '74.220.48.202', NULL, NULL, NULL, NULL, NULL),
	('bab8dec0-ee7f-4499-8363-efe00441c63c', '27728170-0da6-4a27-8351-3ab7291afa57', '2026-04-20 04:23:21.728427+00', '2026-04-20 04:23:21.728427+00', NULL, 'aal1', NULL, NULL, 'node', '74.220.48.202', NULL, NULL, NULL, NULL, NULL),
	('8df7e693-947e-461f-ad61-fbfceee730c7', '187fc7ee-869d-441b-949f-a9e92fec07f6', '2026-04-19 05:06:02.910849+00', '2026-04-19 08:45:26.338975+00', NULL, 'aal1', NULL, '2026-04-19 08:45:26.338864', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.4 Mobile/15E148 Safari/604.1', '114.24.102.47', NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('9853029c-9678-4959-bebb-e831724deccf', '2026-04-18 05:27:32.746956+00', '2026-04-18 05:27:32.746956+00', 'password', '30604a24-25d0-40fd-b809-85ed65aada03'),
	('fd041896-5c18-47ad-97ea-d56ff9eee7a3', '2026-04-18 05:27:54.712087+00', '2026-04-18 05:27:54.712087+00', 'password', '199aa68d-bcbb-40c1-aa87-443e26080098'),
	('0aa8b1f7-03a9-4def-bd3a-bc16652a52c6', '2026-04-18 05:35:52.913888+00', '2026-04-18 05:35:52.913888+00', 'password', '9ba08ee2-41e1-410c-9e47-e1e6eb545b27'),
	('8df7e693-947e-461f-ad61-fbfceee730c7', '2026-04-19 05:06:02.999309+00', '2026-04-19 05:06:02.999309+00', 'password', '2bcf94a2-3947-4510-9143-b1fb67f8ebc8'),
	('473f0cd5-de91-4e93-84d3-2f67210d3f70', '2026-04-19 13:55:02.149431+00', '2026-04-19 13:55:02.149431+00', 'password', '5b4781f9-e59e-4ecc-85b4-d5056ee6b10a'),
	('9034bec5-e746-4f7b-b32e-01b0a66a57e0', '2026-04-20 04:23:07.76051+00', '2026-04-20 04:23:07.76051+00', 'password', '24cfcbdc-9183-4e29-8f9f-e2277659cfbb'),
	('bab8dec0-ee7f-4499-8363-efe00441c63c', '2026-04-20 04:23:21.742754+00', '2026-04-20 04:23:21.742754+00', 'password', 'afeaca0f-a623-4b02-9d8c-f6e56dbcb22b'),
	('a80399d1-90b5-4467-a621-96d3c0b6a001', '2026-04-23 01:01:17.612527+00', '2026-04-23 01:01:17.612527+00', 'password', 'a2fda6e2-7b52-4b00-8ac3-db86a2cfd964'),
	('127cf99e-f084-40c1-b0fa-c00034008b7c', '2026-04-23 10:41:36.292065+00', '2026-04-23 10:41:36.292065+00', 'password', '5883f1b7-8533-4ba6-9c13-ffb90490a807'),
	('89847b93-d6e5-4c4c-89b3-04c3dd385f85', '2026-04-24 06:06:34.959586+00', '2026-04-24 06:06:34.959586+00', 'password', 'd6771864-a6b6-4e0b-8297-f0ac74258bd4');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 70, 'hweuvtxayk37', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', true, '2026-04-19 13:55:02.135746+00', '2026-04-19 23:59:24.296188+00', NULL, '473f0cd5-de91-4e93-84d3-2f67210d3f70'),
	('00000000-0000-0000-0000-000000000000', 78, 'to3mnv6y7xmv', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', true, '2026-04-19 23:59:24.308787+00', '2026-04-20 00:57:58.456878+00', 'hweuvtxayk37', '473f0cd5-de91-4e93-84d3-2f67210d3f70'),
	('00000000-0000-0000-0000-000000000000', 42, 'ybnvuu53kd7a', '240d4a78-1c3a-4a8f-be1d-7e889398178d', false, '2026-04-18 05:27:32.7452+00', '2026-04-18 05:27:32.7452+00', NULL, '9853029c-9678-4959-bebb-e831724deccf'),
	('00000000-0000-0000-0000-000000000000', 43, 'of56r5fat5qs', '240d4a78-1c3a-4a8f-be1d-7e889398178d', false, '2026-04-18 05:27:54.709771+00', '2026-04-18 05:27:54.709771+00', NULL, 'fd041896-5c18-47ad-97ea-d56ff9eee7a3'),
	('00000000-0000-0000-0000-000000000000', 80, 'q2zls2uazwzd', '27728170-0da6-4a27-8351-3ab7291afa57', false, '2026-04-20 04:23:07.713789+00', '2026-04-20 04:23:07.713789+00', NULL, '9034bec5-e746-4f7b-b32e-01b0a66a57e0'),
	('00000000-0000-0000-0000-000000000000', 81, 'exln4dux5kxm', '27728170-0da6-4a27-8351-3ab7291afa57', false, '2026-04-20 04:23:21.738806+00', '2026-04-20 04:23:21.738806+00', NULL, 'bab8dec0-ee7f-4499-8363-efe00441c63c'),
	('00000000-0000-0000-0000-000000000000', 44, 'fmymc6v5hhdd', '240d4a78-1c3a-4a8f-be1d-7e889398178d', true, '2026-04-18 05:35:52.910084+00', '2026-04-18 06:45:50.875603+00', NULL, '0aa8b1f7-03a9-4def-bd3a-bc16652a52c6'),
	('00000000-0000-0000-0000-000000000000', 79, 'oohf3pmpfzno', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', true, '2026-04-20 00:57:58.464112+00', '2026-04-20 05:37:53.998812+00', 'to3mnv6y7xmv', '473f0cd5-de91-4e93-84d3-2f67210d3f70'),
	('00000000-0000-0000-0000-000000000000', 82, 'lpvry4zgkgtc', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', true, '2026-04-20 05:37:54.014254+00', '2026-04-21 00:08:43.664861+00', 'oohf3pmpfzno', '473f0cd5-de91-4e93-84d3-2f67210d3f70'),
	('00000000-0000-0000-0000-000000000000', 83, 'm3yniml3hy4a', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', true, '2026-04-21 00:08:43.686942+00', '2026-04-21 02:32:53.311562+00', 'lpvry4zgkgtc', '473f0cd5-de91-4e93-84d3-2f67210d3f70'),
	('00000000-0000-0000-0000-000000000000', 84, 's7ewry7qzpvj', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', true, '2026-04-21 02:32:53.334958+00', '2026-04-21 03:31:58.787161+00', 'm3yniml3hy4a', '473f0cd5-de91-4e93-84d3-2f67210d3f70'),
	('00000000-0000-0000-0000-000000000000', 85, 'ewnc4j5h6t23', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', true, '2026-04-21 03:31:58.806318+00', '2026-04-21 04:30:59.084561+00', 's7ewry7qzpvj', '473f0cd5-de91-4e93-84d3-2f67210d3f70'),
	('00000000-0000-0000-0000-000000000000', 46, 'bxsel2hkca6d', '240d4a78-1c3a-4a8f-be1d-7e889398178d', true, '2026-04-18 06:45:50.884257+00', '2026-04-18 09:52:21.933002+00', 'fmymc6v5hhdd', '0aa8b1f7-03a9-4def-bd3a-bc16652a52c6'),
	('00000000-0000-0000-0000-000000000000', 51, 'bpzglwgig7fj', '240d4a78-1c3a-4a8f-be1d-7e889398178d', false, '2026-04-18 09:52:21.936981+00', '2026-04-18 09:52:21.936981+00', 'bxsel2hkca6d', '0aa8b1f7-03a9-4def-bd3a-bc16652a52c6'),
	('00000000-0000-0000-0000-000000000000', 86, 'u3riy2u3s2e3', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', true, '2026-04-21 04:30:59.116186+00', '2026-04-21 06:35:55.80461+00', 'ewnc4j5h6t23', '473f0cd5-de91-4e93-84d3-2f67210d3f70'),
	('00000000-0000-0000-0000-000000000000', 87, 'uyidamrkqmub', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', true, '2026-04-21 06:35:55.821142+00', '2026-04-21 08:09:29.369609+00', 'u3riy2u3s2e3', '473f0cd5-de91-4e93-84d3-2f67210d3f70'),
	('00000000-0000-0000-0000-000000000000', 88, '57inyosrktmo', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', true, '2026-04-21 08:09:29.380133+00', '2026-04-21 09:08:58.837629+00', 'uyidamrkqmub', '473f0cd5-de91-4e93-84d3-2f67210d3f70'),
	('00000000-0000-0000-0000-000000000000', 89, 'qrqasjgz4lnk', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', true, '2026-04-21 09:08:58.85341+00', '2026-04-21 12:26:43.307818+00', '57inyosrktmo', '473f0cd5-de91-4e93-84d3-2f67210d3f70'),
	('00000000-0000-0000-0000-000000000000', 90, '5igmcviu7nhv', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', true, '2026-04-21 12:26:43.330667+00', '2026-04-21 13:43:41.132136+00', 'qrqasjgz4lnk', '473f0cd5-de91-4e93-84d3-2f67210d3f70'),
	('00000000-0000-0000-0000-000000000000', 91, '2gw6x5hodipb', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', true, '2026-04-21 13:43:41.14697+00', '2026-04-22 00:21:04.76872+00', '5igmcviu7nhv', '473f0cd5-de91-4e93-84d3-2f67210d3f70'),
	('00000000-0000-0000-0000-000000000000', 92, 't6vfnd5372ha', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', true, '2026-04-22 00:21:04.784347+00', '2026-04-22 01:35:56.934+00', '2gw6x5hodipb', '473f0cd5-de91-4e93-84d3-2f67210d3f70'),
	('00000000-0000-0000-0000-000000000000', 93, '7cn4a2uuwkui', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', true, '2026-04-22 01:35:56.950269+00', '2026-04-22 02:34:59.101942+00', 't6vfnd5372ha', '473f0cd5-de91-4e93-84d3-2f67210d3f70'),
	('00000000-0000-0000-0000-000000000000', 94, 'w7d6ooe3pqxl', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', true, '2026-04-22 02:34:59.120713+00', '2026-04-22 03:33:50.272621+00', '7cn4a2uuwkui', '473f0cd5-de91-4e93-84d3-2f67210d3f70'),
	('00000000-0000-0000-0000-000000000000', 95, 'j2c7znchrpeo', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', true, '2026-04-22 03:33:50.298893+00', '2026-04-22 04:32:59.304256+00', 'w7d6ooe3pqxl', '473f0cd5-de91-4e93-84d3-2f67210d3f70'),
	('00000000-0000-0000-0000-000000000000', 61, '5gpulkesrzny', '187fc7ee-869d-441b-949f-a9e92fec07f6', true, '2026-04-19 05:06:02.962839+00', '2026-04-19 08:45:26.304821+00', NULL, '8df7e693-947e-461f-ad61-fbfceee730c7'),
	('00000000-0000-0000-0000-000000000000', 63, '32dmnr5az5yc', '187fc7ee-869d-441b-949f-a9e92fec07f6', false, '2026-04-19 08:45:26.31699+00', '2026-04-19 08:45:26.31699+00', '5gpulkesrzny', '8df7e693-947e-461f-ad61-fbfceee730c7'),
	('00000000-0000-0000-0000-000000000000', 96, 'uuchelkwl4vd', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', true, '2026-04-22 04:32:59.320644+00', '2026-04-22 05:37:37.655952+00', 'j2c7znchrpeo', '473f0cd5-de91-4e93-84d3-2f67210d3f70'),
	('00000000-0000-0000-0000-000000000000', 97, '2yxh2rrlyvbz', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', true, '2026-04-22 05:37:37.678342+00', '2026-04-22 06:36:53.186288+00', 'uuchelkwl4vd', '473f0cd5-de91-4e93-84d3-2f67210d3f70'),
	('00000000-0000-0000-0000-000000000000', 98, 'fd3nj235hsax', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', true, '2026-04-22 06:36:53.208949+00', '2026-04-22 07:35:55.039576+00', '2yxh2rrlyvbz', '473f0cd5-de91-4e93-84d3-2f67210d3f70'),
	('00000000-0000-0000-0000-000000000000', 99, 'te5ppx5e5coa', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', true, '2026-04-22 07:35:55.068574+00', '2026-04-22 08:34:59.2634+00', 'fd3nj235hsax', '473f0cd5-de91-4e93-84d3-2f67210d3f70'),
	('00000000-0000-0000-0000-000000000000', 100, 'h3csrs657zne', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', true, '2026-04-22 08:34:59.285662+00', '2026-04-22 12:46:34.709065+00', 'te5ppx5e5coa', '473f0cd5-de91-4e93-84d3-2f67210d3f70'),
	('00000000-0000-0000-0000-000000000000', 101, 'uoycd52aldmm', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', true, '2026-04-22 12:46:34.726695+00', '2026-04-23 00:45:39.567532+00', 'h3csrs657zne', '473f0cd5-de91-4e93-84d3-2f67210d3f70'),
	('00000000-0000-0000-0000-000000000000', 102, 'k7nbaeavado2', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', true, '2026-04-23 00:45:39.589109+00', '2026-04-23 01:44:59.397456+00', 'uoycd52aldmm', '473f0cd5-de91-4e93-84d3-2f67210d3f70'),
	('00000000-0000-0000-0000-000000000000', 103, 'gr37fklklndb', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', true, '2026-04-23 01:01:17.591035+00', '2026-04-23 01:59:24.899026+00', NULL, 'a80399d1-90b5-4467-a621-96d3c0b6a001'),
	('00000000-0000-0000-0000-000000000000', 104, 'mk73x7wsgtz4', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', true, '2026-04-23 01:44:59.419013+00', '2026-04-23 02:55:05.46166+00', 'k7nbaeavado2', '473f0cd5-de91-4e93-84d3-2f67210d3f70'),
	('00000000-0000-0000-0000-000000000000', 106, 'hsscmt6rq3si', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', true, '2026-04-23 02:55:05.48841+00', '2026-04-23 03:53:59.522163+00', 'mk73x7wsgtz4', '473f0cd5-de91-4e93-84d3-2f67210d3f70'),
	('00000000-0000-0000-0000-000000000000', 107, 'xmvasaczocpx', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', true, '2026-04-23 03:53:59.541613+00', '2026-04-23 04:52:59.85016+00', 'hsscmt6rq3si', '473f0cd5-de91-4e93-84d3-2f67210d3f70'),
	('00000000-0000-0000-0000-000000000000', 108, 'opzoivqpoepm', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', true, '2026-04-23 04:52:59.86333+00', '2026-04-23 05:51:59.505226+00', 'xmvasaczocpx', '473f0cd5-de91-4e93-84d3-2f67210d3f70'),
	('00000000-0000-0000-0000-000000000000', 109, 'q6dyfznp4rqz', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', true, '2026-04-23 05:51:59.521067+00', '2026-04-23 06:58:03.720589+00', 'opzoivqpoepm', '473f0cd5-de91-4e93-84d3-2f67210d3f70'),
	('00000000-0000-0000-0000-000000000000', 110, '3xre5biflhsr', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', true, '2026-04-23 06:58:03.731235+00', '2026-04-23 07:56:59.564544+00', 'q6dyfznp4rqz', '473f0cd5-de91-4e93-84d3-2f67210d3f70'),
	('00000000-0000-0000-0000-000000000000', 111, 'lriyhyyo3owj', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', true, '2026-04-23 07:56:59.573677+00', '2026-04-23 08:55:57.617228+00', '3xre5biflhsr', '473f0cd5-de91-4e93-84d3-2f67210d3f70'),
	('00000000-0000-0000-0000-000000000000', 112, 'rwflqa3j2a6y', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', true, '2026-04-23 08:55:57.634471+00', '2026-04-23 09:54:56.643325+00', 'lriyhyyo3owj', '473f0cd5-de91-4e93-84d3-2f67210d3f70'),
	('00000000-0000-0000-0000-000000000000', 113, 'uw5pxqwcxtzt', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', true, '2026-04-23 09:54:56.666064+00', '2026-04-23 13:35:06.671188+00', 'rwflqa3j2a6y', '473f0cd5-de91-4e93-84d3-2f67210d3f70'),
	('00000000-0000-0000-0000-000000000000', 114, 'idcjpozfnfns', '27728170-0da6-4a27-8351-3ab7291afa57', true, '2026-04-23 10:41:36.250093+00', '2026-04-24 00:21:05.048619+00', NULL, '127cf99e-f084-40c1-b0fa-c00034008b7c'),
	('00000000-0000-0000-0000-000000000000', 116, 'immkuw7dzgey', '27728170-0da6-4a27-8351-3ab7291afa57', true, '2026-04-24 00:21:05.06321+00', '2026-04-24 01:22:02.817829+00', 'idcjpozfnfns', '127cf99e-f084-40c1-b0fa-c00034008b7c'),
	('00000000-0000-0000-0000-000000000000', 115, 'xwss25bnmigw', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', true, '2026-04-23 13:35:06.684553+00', '2026-04-24 01:22:17.629756+00', 'uw5pxqwcxtzt', '473f0cd5-de91-4e93-84d3-2f67210d3f70'),
	('00000000-0000-0000-0000-000000000000', 118, 'tphpsdgsfujz', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', true, '2026-04-24 01:22:17.634692+00', '2026-04-24 02:21:59.521555+00', 'xwss25bnmigw', '473f0cd5-de91-4e93-84d3-2f67210d3f70'),
	('00000000-0000-0000-0000-000000000000', 119, 'znkroxw5ngw5', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', true, '2026-04-24 02:21:59.538962+00', '2026-04-24 03:20:59.851599+00', 'tphpsdgsfujz', '473f0cd5-de91-4e93-84d3-2f67210d3f70'),
	('00000000-0000-0000-0000-000000000000', 117, 'upycp6rku7or', '27728170-0da6-4a27-8351-3ab7291afa57', true, '2026-04-24 01:22:02.825429+00', '2026-04-24 04:28:44.860701+00', 'immkuw7dzgey', '127cf99e-f084-40c1-b0fa-c00034008b7c'),
	('00000000-0000-0000-0000-000000000000', 105, 'ou4rd2ue36j2', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', true, '2026-04-23 01:59:24.903827+00', '2026-04-24 06:05:00.373617+00', 'gr37fklklndb', 'a80399d1-90b5-4467-a621-96d3c0b6a001'),
	('00000000-0000-0000-0000-000000000000', 120, 'unc6jcjq7h45', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', true, '2026-04-24 03:20:59.86863+00', '2026-04-24 04:28:44.860842+00', 'znkroxw5ngw5', '473f0cd5-de91-4e93-84d3-2f67210d3f70'),
	('00000000-0000-0000-0000-000000000000', 121, 'jzs7ubnnry6f', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', true, '2026-04-24 04:28:44.868289+00', '2026-04-24 05:59:04.957797+00', 'unc6jcjq7h45', '473f0cd5-de91-4e93-84d3-2f67210d3f70'),
	('00000000-0000-0000-0000-000000000000', 122, 'loucb3huyxdr', '27728170-0da6-4a27-8351-3ab7291afa57', true, '2026-04-24 04:28:44.868299+00', '2026-04-24 06:02:08.248328+00', 'upycp6rku7or', '127cf99e-f084-40c1-b0fa-c00034008b7c'),
	('00000000-0000-0000-0000-000000000000', 124, 'k4742zpvucl4', '27728170-0da6-4a27-8351-3ab7291afa57', false, '2026-04-24 06:02:08.254628+00', '2026-04-24 06:02:08.254628+00', 'loucb3huyxdr', '127cf99e-f084-40c1-b0fa-c00034008b7c'),
	('00000000-0000-0000-0000-000000000000', 125, 'm6kplrs3yly3', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', false, '2026-04-24 06:05:00.381444+00', '2026-04-24 06:05:00.381444+00', 'ou4rd2ue36j2', 'a80399d1-90b5-4467-a621-96d3c0b6a001'),
	('00000000-0000-0000-0000-000000000000', 126, 'gqwc33cz4rzx', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', true, '2026-04-24 06:06:34.947706+00', '2026-04-24 07:25:10.062454+00', NULL, '89847b93-d6e5-4c4c-89b3-04c3dd385f85'),
	('00000000-0000-0000-0000-000000000000', 123, 'jo7uow45mhzt', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', true, '2026-04-24 05:59:04.968324+00', '2026-04-24 07:28:10.082403+00', 'jzs7ubnnry6f', '473f0cd5-de91-4e93-84d3-2f67210d3f70'),
	('00000000-0000-0000-0000-000000000000', 128, 'lbmp2xijuh4d', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', false, '2026-04-24 07:28:10.086032+00', '2026-04-24 07:28:10.086032+00', 'jo7uow45mhzt', '473f0cd5-de91-4e93-84d3-2f67210d3f70'),
	('00000000-0000-0000-0000-000000000000', 127, 'xk5fo5otybk6', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', true, '2026-04-24 07:25:10.081908+00', '2026-04-24 08:23:36.166377+00', 'gqwc33cz4rzx', '89847b93-d6e5-4c4c-89b3-04c3dd385f85'),
	('00000000-0000-0000-0000-000000000000', 129, 'tqcowrqtzg4v', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', true, '2026-04-24 08:23:36.1865+00', '2026-04-24 09:22:06.132861+00', 'xk5fo5otybk6', '89847b93-d6e5-4c4c-89b3-04c3dd385f85'),
	('00000000-0000-0000-0000-000000000000', 130, '5rt7rx6hlki2', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', true, '2026-04-24 09:22:06.139342+00', '2026-04-26 03:43:08.97627+00', 'tqcowrqtzg4v', '89847b93-d6e5-4c4c-89b3-04c3dd385f85'),
	('00000000-0000-0000-0000-000000000000', 131, '22imqyti4ctg', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', false, '2026-04-26 03:43:09.000146+00', '2026-04-26 03:43:09.000146+00', '5rt7rx6hlki2', '89847b93-d6e5-4c4c-89b3-04c3dd385f85');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("id", "display_name", "avatar_url", "location", "created_at") VALUES
	('240d4a78-1c3a-4a8f-be1d-7e889398178d', '狗頭', NULL, '0101000020E6100000178B09C899605E40680601FEE3FF3840', '2026-04-18 05:27:32.8989+00'),
	('187fc7ee-869d-441b-949f-a9e92fec07f6', 'KIDD', NULL, '0101000020E6100000D5324D2E9B605E40058C8B9DDBFF3840', '2026-04-18 05:14:29.609682+00'),
	('c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', '小狗汪汪', NULL, '0101000020E610000045C48FFB99605E40E456CD19DCFF3840', '2026-04-18 05:24:36.708667+00'),
	('27728170-0da6-4a27-8351-3ab7291afa57', 'C8', NULL, '0101000020E6100000E75A9C689A605E4089B9EAF4DBFF3840', '2026-04-19 11:56:33.555713+00');


--
-- Data for Name: expense_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."expense_categories" ("id", "code", "name", "icon", "color", "is_system", "created_by_user_id", "sort_order", "created_at") VALUES
	('c0c035ba-f670-4b34-b044-8a782c5f353a', 'food', '飼料', '🥣', '#F59E0B', true, NULL, 10, '2026-04-23 05:27:19.771612+00'),
	('b716c0ed-f1de-40cd-8de5-8b26643c21a1', 'treats', '零食', '🍖', '#FBBF24', true, NULL, 20, '2026-04-23 05:27:19.771612+00'),
	('2f6fb48b-3c4b-4fa3-8eb2-c40ebe8dae8b', 'medical', '醫療', '💊', '#EF4444', true, NULL, 30, '2026-04-23 05:27:19.771612+00'),
	('b393e1ce-17fb-406f-b1ed-c6e00657fcce', 'grooming', '美容', '✂️', '#8B5CF6', true, NULL, 40, '2026-04-23 05:27:19.771612+00'),
	('fc523afb-ce7f-4a4b-bd14-6938a624f41c', 'boarding', '寄宿', '🏠', '#10B981', true, NULL, 50, '2026-04-23 05:27:19.771612+00'),
	('9da2d8bd-e425-4097-afbe-a119a32405f8', 'toys', '玩具', '🎾', '#3B82F6', true, NULL, 60, '2026-04-23 05:27:19.771612+00'),
	('12181303-06d2-48ff-90ae-002afdbd781d', 'training', '訓練', '🎓', '#6366F1', true, NULL, 70, '2026-04-23 05:27:19.771612+00'),
	('6cbf140c-1813-4f2a-ad67-e00d6678a15b', 'other', '其他', '📦', '#6B7280', true, NULL, 99, '2026-04-23 05:27:19.771612+00');


--
-- Data for Name: dog_expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."dog_expenses" ("id", "category_id", "amount", "currency", "spent_at", "paid_by_user_id", "merchant", "notes", "receipt_photo_url", "receipt_data", "created_at", "updated_at") VALUES
	('a878f48d-1da6-4197-a1d7-db8efb414826', 'c0c035ba-f670-4b34-b044-8a782c5f353a', 2000.00, 'TWD', '2026-04-24', '27728170-0da6-4a27-8351-3ab7291afa57', 'hola', '', NULL, '{}', '2026-04-24 01:56:52.24007+00', '2026-04-24 01:56:52.24007+00');


--
-- Data for Name: dog_genders; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."dog_genders" ("code", "label", "sort_order", "created_at") VALUES
	('male', '公', 10, '2026-04-23 05:27:19.771612+00'),
	('female', '母', 20, '2026-04-23 05:27:19.771612+00'),
	('unknown', '未知', 30, '2026-04-23 05:27:19.771612+00');


--
-- Data for Name: dog_sizes; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."dog_sizes" ("code", "label", "sort_order", "created_at") VALUES
	('small', '小型 (10kg 以下)', 10, '2026-04-23 05:27:19.771612+00'),
	('medium', '中型 (10-25kg)', 20, '2026-04-23 05:27:19.771612+00'),
	('large', '大型 (25kg 以上)', 30, '2026-04-23 05:27:19.771612+00');


--
-- Data for Name: dogs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."dogs" ("id", "owner_id", "name", "breed", "age_months", "gender", "size", "personality", "bio", "photos", "is_active", "created_at", "city", "district", "walking_locations", "walking_times", "walking_frequency", "walking_spots") VALUES
	('893fe47d-617a-4ac1-acf6-8d277c64ff8b', '187fc7ee-869d-441b-949f-a9e92fec07f6', 'OHANA', '伯恩山犬', 6, 'female', 'large', '{黏人,害羞,皮}', '膽小狗，不愛散步', '{https://ykckeqhmyligkskpvhrr.supabase.co/storage/v1/object/public/dog-photos/187fc7ee-869d-441b-949f-a9e92fec07f6/1776489372470.jpeg}', true, '2026-04-18 05:17:22.344339+00', '新北市', '中和區', '{公園}', '{morning}', 'weekend', '{中和四號公園}'),
	('924c01fc-229e-40a0-9b8b-4251f5084bc8', '240d4a78-1c3a-4a8f-be1d-7e889398178d', '大胖', '伯恩山', 5, 'female', 'large', '{溫和,黏人,害羞,愛撒嬌,憨}', '笨笨傻傻的 喜歡亂吠', '{https://ykckeqhmyligkskpvhrr.supabase.co/storage/v1/object/public/dog-photos/240d4a78-1c3a-4a8f-be1d-7e889398178d/1776490131811.jpeg}', true, '2026-04-18 05:31:02.301066+00', '新北市', '中和區', '{公園}', '{morning}', 'weekend', '{四號公園}'),
	('874f9f0a-b289-44a5-9956-bc595bdfa3ad', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', '柴柴', '柴犬', 9, 'male', 'small', '{黏人,獨立,友善}', '你不理柴，柴不理你', '{https://ykckeqhmyligkskpvhrr.supabase.co/storage/v1/object/public/dog-photos/c3e53c0a-c93a-4ea0-99e8-307d232ec1ae/1776491416812.png}', true, '2026-04-18 05:51:02.908103+00', '新北市', '永和區', '{學校操場,河堤,公園}', '{afternoon}', 'daily', '{}'),
	('0ba4430a-a6ec-499f-a818-9af61d96f3f8', '27728170-0da6-4a27-8351-3ab7291afa57', '小賤狗', '臘腸', 19, 'male', 'small', '{友善,害羞,皮蛋}', '我害羞', '{https://ykckeqhmyligkskpvhrr.supabase.co/storage/v1/object/public/dog-photos/27728170-0da6-4a27-8351-3ab7291afa57/1776599830412.jpeg}', true, '2026-04-19 11:58:49.00069+00', '新北市', '永和區', '{公園}', '{evening}', 'occasionally', '{}');


--
-- Data for Name: expense_contributors; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: expense_pets; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."expense_pets" ("id", "expense_id", "dog_id", "share_ratio", "created_at") VALUES
	('f7a5e390-f023-422a-b930-5c88e8e63273', 'a878f48d-1da6-4197-a1d7-db8efb414826', '0ba4430a-a6ec-499f-a818-9af61d96f3f8', 1.0000, '2026-04-24 01:56:52.395503+00');


--
-- Data for Name: health_record_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."health_record_types" ("code", "label", "unit", "icon", "color", "has_reminder", "sort_order", "created_at") VALUES
	('vaccine', '疫苗', NULL, '💉', '#3B82F6', true, 10, '2026-04-23 05:27:19.771612+00'),
	('weight', '體重', 'kg', '⚖️', '#10B981', false, 20, '2026-04-23 05:27:19.771612+00'),
	('medication', '用藥', NULL, '💊', '#EF4444', true, 30, '2026-04-23 05:27:19.771612+00'),
	('vet_visit', '看診', NULL, '🏥', '#8B5CF6', false, 40, '2026-04-23 05:27:19.771612+00'),
	('grooming', '美容', NULL, '✂️', '#EC4899', false, 60, '2026-04-23 05:27:19.771612+00'),
	('other', '其他', NULL, '📋', '#6B7280', false, 90, '2026-04-24 07:31:55.097535+00');


--
-- Data for Name: health_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."health_records" ("id", "dog_id", "type_code", "recorded_at", "title", "numeric_value", "notes", "document_url", "metadata", "next_due_at", "recorded_by_user_id", "created_at", "updated_at") VALUES
	('da4e5abe-bb2a-41ca-80bf-37f3a3495626', '874f9f0a-b289-44a5-9956-bc595bdfa3ad', 'vaccine', '2026-04-24', '八合一', NULL, '建議提早打', NULL, '{}', '2026-08-09', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', '2026-04-24 07:44:44.714101+00', '2026-04-24 07:44:44.714101+00'),
	('9e1b7379-0ec6-4e68-96f2-918384464ce6', '874f9f0a-b289-44a5-9956-bc595bdfa3ad', 'medication', '2026-04-24', '減肥藥', NULL, '少吃點', NULL, '{}', '2026-09-08', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', '2026-04-24 07:45:17.960622+00', '2026-04-24 07:45:17.960622+00'),
	('aca3382c-1174-43ec-89e9-3e7a2e6e598d', '874f9f0a-b289-44a5-9956-bc595bdfa3ad', 'vet_visit', '2026-04-24', '皮在癢', NULL, '不要舔', NULL, '{}', NULL, 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', '2026-04-24 07:45:46.612066+00', '2026-04-24 07:45:46.612066+00'),
	('a7380651-504a-4049-bdc3-5c468078a965', '874f9f0a-b289-44a5-9956-bc595bdfa3ad', 'vet_visit', '2026-04-24', '腳底美白', NULL, '', NULL, '{}', NULL, 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', '2026-04-24 07:46:05.016406+00', '2026-04-24 07:46:05.016406+00'),
	('4c60b9ff-a6e9-49b3-bd97-f8bcfbbca3ce', '874f9f0a-b289-44a5-9956-bc595bdfa3ad', 'weight', '2026-04-24', '', 30.000, '', NULL, '{}', NULL, 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', '2026-04-24 07:46:31.640079+00', '2026-04-24 07:46:31.640079+00'),
	('c22bba7c-57d4-41e3-b32c-a73093875cda', '874f9f0a-b289-44a5-9956-bc595bdfa3ad', 'grooming', '2026-04-24', '', NULL, '腳底美白', NULL, '{}', NULL, 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', '2026-04-24 07:46:50.91083+00', '2026-04-24 07:46:50.91083+00');


--
-- Data for Name: matches; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."matches" ("id", "dog_a_id", "dog_b_id", "created_at") VALUES
	('4bf8effd-ed70-45fb-bdac-6cb277dbf5c6', '874f9f0a-b289-44a5-9956-bc595bdfa3ad', '924c01fc-229e-40a0-9b8b-4251f5084bc8', '2026-04-18 10:05:56.060886+00'),
	('4af1a7c9-0829-49de-8a56-c0566e07a676', '893fe47d-617a-4ac1-acf6-8d277c64ff8b', '874f9f0a-b289-44a5-9956-bc595bdfa3ad', '2026-04-18 10:31:24.432718+00'),
	('2510ef56-5902-465f-b721-beca81fade63', '874f9f0a-b289-44a5-9956-bc595bdfa3ad', '0ba4430a-a6ec-499f-a818-9af61d96f3f8', '2026-04-19 13:55:08.324369+00');


--
-- Data for Name: user_matches; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."user_matches" ("id", "user_a_id", "user_b_id", "created_at") VALUES
	('2804ecb8-a576-47b6-9441-aff8f9279cf1', '240d4a78-1c3a-4a8f-be1d-7e889398178d', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', '2026-04-23 05:27:51.977329+00'),
	('53c1589a-776d-4f97-a581-e6deb08d97ae', '187fc7ee-869d-441b-949f-a9e92fec07f6', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', '2026-04-23 05:27:51.977329+00'),
	('0224db62-4c61-4aa0-ab8f-23f518e3b530', '27728170-0da6-4a27-8351-3ab7291afa57', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', '2026-04-23 05:27:51.977329+00');


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."messages" ("id", "match_id", "sender_id", "content", "created_at", "user_match_id") VALUES
	('b2460e26-8bef-42f7-a3a8-6a8f2e229895', '4bf8effd-ed70-45fb-bdac-6cb277dbf5c6', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', '肥仔', '2026-04-18 10:38:05.465529+00', '2804ecb8-a576-47b6-9441-aff8f9279cf1'),
	('8b6aba7d-24cb-431d-8450-ae3ccc7e7d43', '4bf8effd-ed70-45fb-bdac-6cb277dbf5c6', '240d4a78-1c3a-4a8f-be1d-7e889398178d', '肥仔', '2026-04-18 10:40:10.03733+00', '2804ecb8-a576-47b6-9441-aff8f9279cf1'),
	('fe227488-ba13-4c31-8abe-8484ac8ff66d', '4bf8effd-ed70-45fb-bdac-6cb277dbf5c6', '240d4a78-1c3a-4a8f-be1d-7e889398178d', '為什麼不能編輯 差評', '2026-04-18 10:42:41.174274+00', '2804ecb8-a576-47b6-9441-aff8f9279cf1'),
	('2f598168-bde3-4e9d-9bd6-2d3f77c9bdfc', '4bf8effd-ed70-45fb-bdac-6cb277dbf5c6', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', '現在可以編輯了', '2026-04-19 08:48:36.104541+00', '2804ecb8-a576-47b6-9441-aff8f9279cf1'),
	('9c8b5a64-2fd6-442d-94a9-36e0a4e3d708', '4bf8effd-ed70-45fb-bdac-6cb277dbf5c6', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', '肥仔', '2026-04-19 08:48:40.227675+00', '2804ecb8-a576-47b6-9441-aff8f9279cf1');


--
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--



--
-- Data for Name: swipes; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."swipes" ("id", "swiper_dog_id", "swiped_dog_id", "direction", "created_at") VALUES
	('618b7945-14ae-49d3-961b-38c522f0258d', '924c01fc-229e-40a0-9b8b-4251f5084bc8', '893fe47d-617a-4ac1-acf6-8d277c64ff8b', 'pass', '2026-04-18 05:32:52.693866+00'),
	('fe3d1b6d-7cde-4255-8147-57704aac75ac', '924c01fc-229e-40a0-9b8b-4251f5084bc8', '874f9f0a-b289-44a5-9956-bc595bdfa3ad', 'like', '2026-04-18 06:12:06.539479+00'),
	('984057b3-7dfb-4630-bc9d-302cf542c398', '893fe47d-617a-4ac1-acf6-8d277c64ff8b', '924c01fc-229e-40a0-9b8b-4251f5084bc8', 'like', '2026-04-18 09:54:04.157566+00'),
	('a2ca854e-9b14-4e18-bc45-03c1b1bed8f2', '874f9f0a-b289-44a5-9956-bc595bdfa3ad', '893fe47d-617a-4ac1-acf6-8d277c64ff8b', 'like', '2026-04-18 10:05:52.98955+00'),
	('e6e4455e-f9b2-470d-a0a4-75c71fd1f127', '874f9f0a-b289-44a5-9956-bc595bdfa3ad', '924c01fc-229e-40a0-9b8b-4251f5084bc8', 'like', '2026-04-18 10:05:55.655761+00'),
	('7ede9bc5-285d-4b3f-bab8-37aca17d10c9', '893fe47d-617a-4ac1-acf6-8d277c64ff8b', '874f9f0a-b289-44a5-9956-bc595bdfa3ad', 'like', '2026-04-18 10:31:24.029164+00'),
	('cea2b485-d408-45b2-b670-2e76713a5d73', '0ba4430a-a6ec-499f-a818-9af61d96f3f8', '874f9f0a-b289-44a5-9956-bc595bdfa3ad', 'like', '2026-04-19 11:59:24.37617+00'),
	('b163245f-08e1-4896-9932-d6f687083a94', '874f9f0a-b289-44a5-9956-bc595bdfa3ad', '0ba4430a-a6ec-499f-a818-9af61d96f3f8', 'like', '2026-04-19 13:55:07.730855+00');


--
-- Data for Name: walk_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."walk_groups" ("id", "creator_id", "creator_dog_id", "title", "location", "walk_date", "walk_time", "notes", "max_members", "is_active", "created_at") VALUES
	('c7dd62c1-e14e-4751-a495-e5b94fc0f73b', '240d4a78-1c3a-4a8f-be1d-7e889398178d', '924c01fc-229e-40a0-9b8b-4251f5084bc8', '四號公園', '四號公園', '2026-04-19', 'morning', '自備餐具', 1, true, '2026-04-18 10:41:20.986282+00'),
	('1424070e-a26d-4384-b5ee-4dcdd8b9e0c8', '187fc7ee-869d-441b-949f-a9e92fec07f6', '893fe47d-617a-4ac1-acf6-8d277c64ff8b', '四號公園', '四號公園', '2026-04-19', 'afternoon', '', 5, true, '2026-04-18 13:43:27.322838+00');


--
-- Data for Name: walk_group_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."walk_group_members" ("id", "group_id", "user_id", "dog_id", "joined_at", "status") VALUES
	('c16ae1fb-7c00-46e9-84e9-f6dae71cbd4e', '1424070e-a26d-4384-b5ee-4dcdd8b9e0c8', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', '874f9f0a-b289-44a5-9956-bc595bdfa3ad', '2026-04-18 13:43:57.061355+00', 'approved');


--
-- Data for Name: walk_group_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."walk_group_messages" ("id", "group_id", "sender_id", "content", "created_at") VALUES
	('435bdb0a-6773-4916-902a-bc1ca87de9a6', '1424070e-a26d-4384-b5ee-4dcdd8b9e0c8', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', '明天是幾點', '2026-04-18 13:44:34.202574+00');


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") VALUES
	('dog-photos', 'dog-photos', NULL, '2026-04-12 11:59:04.65468+00', '2026-04-12 11:59:04.65468+00', true, false, NULL, NULL, NULL, 'STANDARD');


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."objects" ("id", "bucket_id", "name", "owner", "created_at", "updated_at", "last_accessed_at", "metadata", "version", "owner_id", "user_metadata") VALUES
	('87bb94ae-2b6a-4115-b359-715299bd4349', 'dog-photos', '55a8beef-05cb-4cf5-b92f-a39196f651da/1776168405767.jpeg', '55a8beef-05cb-4cf5-b92f-a39196f651da', '2026-04-14 12:06:46.383014+00', '2026-04-14 12:06:46.383014+00', '2026-04-14 12:06:46.383014+00', '{"eTag": "\"cf63d461f67aa7a654c12e1092c21905\"", "size": 2178429, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-04-14T12:06:47.000Z", "contentLength": 2178429, "httpStatusCode": 200}', '9f068f0b-4d58-4d40-912f-f4d247e77907', '55a8beef-05cb-4cf5-b92f-a39196f651da', '{}'),
	('22fe1d73-dcba-4ef3-b3e6-16ea98f7b785', 'dog-photos', 'c94522d2-d4a9-4873-b35a-bd7b291811b3/1776243911524.jpeg', 'c94522d2-d4a9-4873-b35a-bd7b291811b3', '2026-04-15 09:05:12.987919+00', '2026-04-15 09:05:12.987919+00', '2026-04-15 09:05:12.987919+00', '{"eTag": "\"4203a37546a5c9ee2004dd81714450bc\"", "size": 1108688, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-04-15T09:05:13.000Z", "contentLength": 1108688, "httpStatusCode": 200}', '443a9ae7-f689-4ed0-9ca5-8f08de150b8c', 'c94522d2-d4a9-4873-b35a-bd7b291811b3', '{}'),
	('a832ad01-ebfc-4bfd-ba39-06ac6570288c', 'dog-photos', 'e81fd475-1ac7-4243-92ac-c6f81de1343e/1776244117703.jpeg', 'e81fd475-1ac7-4243-92ac-c6f81de1343e', '2026-04-15 09:08:38.970861+00', '2026-04-15 09:08:38.970861+00', '2026-04-15 09:08:38.970861+00', '{"eTag": "\"fa155ea0b7a6621bd2f9d3f870c90b5d\"", "size": 401282, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-04-15T09:08:39.000Z", "contentLength": 401282, "httpStatusCode": 200}', 'c0037a7a-ea39-4194-8e04-8687c68a5bd7', 'e81fd475-1ac7-4243-92ac-c6f81de1343e', '{}'),
	('8074e361-fa2b-47db-a9ff-6533be33dacf', 'dog-photos', '187fc7ee-869d-441b-949f-a9e92fec07f6/1776489372470.jpeg', '187fc7ee-869d-441b-949f-a9e92fec07f6', '2026-04-18 05:16:13.123151+00', '2026-04-18 05:16:13.123151+00', '2026-04-18 05:16:13.123151+00', '{"eTag": "\"2c43a41c466f95fc868cb1993e03770f\"", "size": 1531297, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-04-18T05:16:14.000Z", "contentLength": 1531297, "httpStatusCode": 200}', 'a473d3ef-79ca-432d-b053-58a6eb95aed4', '187fc7ee-869d-441b-949f-a9e92fec07f6', '{}'),
	('d4fed2a0-0f30-4004-9455-4d00681a671b', 'dog-photos', '240d4a78-1c3a-4a8f-be1d-7e889398178d/1776490131811.jpeg', '240d4a78-1c3a-4a8f-be1d-7e889398178d', '2026-04-18 05:28:52.977018+00', '2026-04-18 05:28:52.977018+00', '2026-04-18 05:28:52.977018+00', '{"eTag": "\"6d2055bd4a51d4d1523a1bcd019b664f\"", "size": 2321573, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-04-18T05:28:53.000Z", "contentLength": 2321573, "httpStatusCode": 200}', '4dc116ec-2b89-43b5-8214-a5679127fc6f', '240d4a78-1c3a-4a8f-be1d-7e889398178d', '{}'),
	('5c286793-ecb8-495e-b3a8-cb509187ef05', 'dog-photos', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae/1776490135482.png', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', '2026-04-18 05:28:58.08889+00', '2026-04-18 05:28:58.08889+00', '2026-04-18 05:28:58.08889+00', '{"eTag": "\"29f569b89b6d72422ccea7f2c6619164-2\"", "size": 9570758, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-04-18T05:28:58.000Z", "contentLength": 9570758, "httpStatusCode": 200}', '0e5918fb-2f76-45e5-b97a-998281011c03', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', '{}'),
	('abe9a8c1-ae30-4cc8-ae99-2d044b83b145', 'dog-photos', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae/1776490556155.png', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', '2026-04-18 05:35:58.491652+00', '2026-04-18 05:35:58.491652+00', '2026-04-18 05:35:58.491652+00', '{"eTag": "\"29f569b89b6d72422ccea7f2c6619164-2\"", "size": 9570758, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-04-18T05:35:59.000Z", "contentLength": 9570758, "httpStatusCode": 200}', '9784b1e2-ff28-4649-9b6c-1f97050581c1', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', '{}'),
	('d91b65e2-a201-432d-bba5-73f55ac698a6', 'dog-photos', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae/1776491416812.png', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', '2026-04-18 05:50:19.381692+00', '2026-04-18 05:50:19.381692+00', '2026-04-18 05:50:19.381692+00', '{"eTag": "\"29f569b89b6d72422ccea7f2c6619164-2\"", "size": 9570758, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-04-18T05:50:20.000Z", "contentLength": 9570758, "httpStatusCode": 200}', '51323144-7b67-43ba-9c14-cc0c89b7a4f3', 'c3e53c0a-c93a-4ea0-99e8-307d232ec1ae', '{}'),
	('2f8c8901-5182-4a67-8dd5-b990e5c6bc17', 'dog-photos', '27728170-0da6-4a27-8351-3ab7291afa57/1776599830412.jpeg', '27728170-0da6-4a27-8351-3ab7291afa57', '2026-04-19 11:57:10.802808+00', '2026-04-19 11:57:10.802808+00', '2026-04-19 11:57:10.802808+00', '{"eTag": "\"f3a0eaf1ef9e641121be4465721c3871\"", "size": 350813, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-04-19T11:57:11.000Z", "contentLength": 350813, "httpStatusCode": 200}', '22a1e532-43f1-405e-b360-36f59cb0571f', '27728170-0da6-4a27-8351-3ab7291afa57', '{}');


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 131, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict kCynOTjBQSYldRRrPAXcgGbX9HKGZdPcXDToiwynG7hNQ9OfwKU6n1Ml6zPXq1k

RESET ALL;
