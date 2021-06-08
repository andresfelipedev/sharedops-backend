# Sharedops (back-end)

Sharedops is a website where people can share their opinions. This is the back-end for Sharedops, built with:

* Node JS - To use JavaScript on the server side.
* Express - To use MVC architecture on the server side.
* MongoDB - To store large amounts of both data and traffic.

This website is also made with learning porpuses.

## Installation

1. Open the command prompt and clone this repository.
```bash
mkdir sharedops-backend
cd sharedops-backend
git clone https://github.com/andresfelipedev/sharedops-backend.git
```

2. Run `npm install` if your using [**npm**](https://www.npmjs.com/) or `yarn install` if your using [**yarn**](https://yarnpkg.com/) instead.

3. Create a `.env` file in the root directory with the next variables:
```
DB_HOST=localhost
DB_NAME=sharedops
TOKEN_KEY="Token-Auth"
```

4. Execute `npm run dev`.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)