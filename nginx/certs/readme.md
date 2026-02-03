# generating the localhost certificates

We need to generate a ssl certificate to secure the connection to the reverse proxy service.

## prerequisits

Install mkcert using your package manager of choice that hosts mkcert.

## command

```sh
# generate the certificate using mkcert
mkcert localhost adminldap.localhost protected.localhost 

# macos supports adding the certificate to the trusted keychain.
mkcert --install

# ensure that the files are renamed to localhost.pem and localhost-key.pem
```
