# hackillinois-api-demo

Express + Mongoose + Zod API for volunteers signing up for shifts.

## Run

```
npm install
echo "MONGODB_URI=<your mongo uri>" > .env
npm run dev
```

## Routes

```
GET/POST        /volunteers
GET/PUT/DELETE  /volunteers/:id
GET/POST        /shifts
GET/PUT/DELETE  /shifts/:id
POST            /shifts/:id/signup              { volunteerId }
DELETE          /shifts/:id/signup/:volunteerId
```

## Demo / test

With the server running:

```
npm run demo   # step through with Enter, shows DB after each request
npm test       # same steps, no pauses, exits 1 on failure
```
