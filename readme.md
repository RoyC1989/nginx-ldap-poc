# nginx-ldap-POC

This repository is a proof of concept to add authentication responsibilities to the nginx service so protected microservices do not need to be designed with authentication in mind. Instead the authentication is done on the loadbalancer level. This way its possible to reuse the same authentication on a 