insert into service_providers (service_provider_sid, name) 
values ('3f35518f-5a0d-4c2e-90a5-2407bb3b36f0', 'SP A');
insert into service_providers (service_provider_sid, name, root_domain, registration_hook) 
values ('a79d3ade-e0da-4461-80f3-7c73f01e18b4', 'SP B', 'example.com','http://127.0.0.1:4000');
insert into service_providers (service_provider_sid, name, root_domain, registration_hook, hook_basic_auth_user, hook_basic_auth_password) 
values ('7e306626-4ee9-471b-af8d-27d9f6042fc9', 'SP C', 'drachtio.org','http://127.0.0.1:4000', 'foo', 'bar');
insert into accounts (account_sid, name, service_provider_sid)
values ('ee9d7d49-b3e4-4fdb-9d66-661149f717e8', 'Account A1', '3f35518f-5a0d-4c2e-90a5-2407bb3b36f0');
insert into accounts (account_sid, name, service_provider_sid, sip_realm, registration_hook)
values ('5f190a4f-b997-4f04-b56e-03c627ea547d', 'Account A2', '3f35518f-5a0d-4c2e-90a5-2407bb3b36f0', 'customerA.mycompany.com', 'http://127.0.0.1:3000');

insert into voip_carriers (voip_carrier_sid, name) values ('287c1452-620d-4195-9f19-c9814ef90d78', 'westco');
insert into sip_gateways (sip_gateway_sid, voip_carrier_sid, ipv4, inbound, outbound) 
values ('124a5339-c62c-4075-9e19-f4de70a96597', '287c1452-620d-4195-9f19-c9814ef90d78', '3.3.3.3', true, true);
insert into sip_gateways (sip_gateway_sid, voip_carrier_sid, ipv4, port, inbound, outbound) 
values ('efbc4830-57cd-4c78-a56f-d64fdf210fe8', '287c1452-620d-4195-9f19-c9814ef90d78', '3.3.3.3', 5062, false, true);
