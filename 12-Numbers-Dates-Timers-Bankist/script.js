"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2020-04-01T10:17:24.185Z",
    "2020-05-08T14:11:59.604Z",
    "2020-07-26T17:01:17.194Z",
    "2020-07-28T23:36:17.929Z",
    "2020-08-01T10:51:36.790Z",
  ],
  currency: "EUR",
  locale: "pt-PT", // de-DE
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-01-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-04-10T14:43:26.374Z",
    "2020-06-25T18:49:59.371Z",
    "2020-07-26T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);
  if (daysPassed === 0) return "Today";
  if (daysPassed === 1) return "Yesterday";
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  // else {
  //   const day = `${date.getDate()}`.padStart(2, 0);
  //   const month = `${date.getMonth() + 1}`.padStart(2, 0);
  //   const year = date.getFullYear();
  //   return `${day}/${month}/${year}`;
  // }
  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = "";

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? "deposit" : "withdrawal";

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter((mov) => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(out, acc.locale, acc.currency);

  const interest = acc.movements
    .filter((mov) => mov > 0)
    .map((deposit) => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(" ")
      .map((name) => name[0])
      .join("");
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    // In each call, print the remaining time to UI
    labelTimer.textContent = `${min} : ${sec}`;

    // When 0 seconds, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = "Log in to get started";
      containerApp.style.opacity = 0;
    }
    // Decrease 1s
    time--;
  };
  // set time to 5 minutes
  let time = 300;

  // call the timer every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

// FAKE ALWAYS LOGGED IN
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

// Experimenting API
// const now = new Date();
// const options = {
//   hour: "numeric",
//   minute: "numeric",
//   day: "numeric",
//   month: "long",
//   year: "numeric",
//   weekday: "long",
// };
// const locale = navigator.language;
// console.log(locale);

// labelDate.textContent = new Intl.DateTimeFormat(locale, options).format(now);

btnLogin.addEventListener("click", function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    (acc) => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(" ")[0]
    }`;
    containerApp.style.opacity = 100;

    // Create current date and time
    const now = new Date();
    const options = {
      hour: "numeric",
      minute: "numeric",
      day: "numeric",
      month: "long",
      year: "numeric",
      // weekday: "long",
    };

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);
    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const min = `${now.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = "";
    inputLoginPin.blur();

    // Starting the logout timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    (acc) => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = "";

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);
  }
  // Reset Timer
  clearInterval(timer);
  startLogOutTimer();
});

btnLoan.addEventListener("click", function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (
    amount > 0 &&
    currentAccount.movements.some((mov) => mov >= amount * 0.1)
  ) {
    const loanTimer = setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);

      // Add loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);
    }, 2500);
  }
  inputLoanAmount.value = "";
  // Reset Timer
  clearInterval(timer);
  startLogOutTimer();
});

btnClose.addEventListener("click", function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      (acc) => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = "";
});

let sorted = false;
btnSort.addEventListener("click", function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
/* 
console.log(23 === 23.0);

// Base 10 - 0 to 9. 1/10 = 0.1. 10/3 = 3.33333
// Binary base 2 - 0 1
console.log(0.1 + 0.2);
console.log(0.1 + 0.2 === 0.3);

console.log(Number("23"));
console.log(+"23"); // type coercion

// Parsing
console.log(Number.parseInt("30px", 10)); // Output: 30
console.log(Number.parseInt("e30", 10)); // Output: NaN

console.log(Number.parseFloat("2.5rem")); // Output: 2.5
console.log(Number.parseInt("2.5rem")); // Output: 2

// console.log(parseInt("2.5rem")); // Output: 2 :: This is an old school way!

// Checki if value is NaN
console.log(Number.isNaN(20)); // Output: false
console.log(Number.isNaN("20")); // Output: false
console.log(Number.isNaN(+"20X")); // Output: true
console.log(Number.isNaN(23 / 0)); // Output: false

// Checking if value is a number
console.log(Number.isFinite(20)); // Output: true
console.log(Number.isFinite("20")); // Output: false
console.log(Number.isFinite(+"20X")); // Output: false
console.log(Number.isFinite(23 / 0)); // Output: false

console.log(Number.isInteger(23)); // Output: true
console.log(Number.isInteger(23.0)); // Output: true
console.log(Number.isInteger(23 / 0)); // Output: false


// Math and Rounding
console.log(Math.sqrt(25));
console.log(25 ** (1 / 2));
console.log(8 ** (1 / 3));

console.log(Math.max(5, 18, 23, 11, 2)); // Output: 23
console.log(Math.max(5, 18, "23", 11, 2)); // Output: 23
console.log(Math.max(5, 18, "23px", 11, 2)); // Output: NaN

console.log(Math.min(5, 18, 23, 11, 2)); // Output: 2
console.log(Math.min(5, 18, "23", 11, 2)); // Output: 2

console.log(Math.PI);
console.log(Math.PI * Number.parseFloat("10px") ** 2);

console.log(Math.trunc(Math.random() * 6) + 1); // Random number between 1 and 6

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + 1) + min;
// 0...1 -> 0...(max - min) -> min...max

// console.log(randomInt(10, 20));

// Rounding Integers
console.log(Math.trunc(23.3));

console.log(Math.round(23.3)); // Output: 23
console.log(Math.round(23.9)); // Output: 24

console.log(Math.ceil(23.3)); // Output: 24
console.log(Math.ceil(23.9)); // Output: 30

console.log(Math.floor(23.3)); // Output: 23
console.log(Math.floor("23.9")); // Output: 23

console.log(Math.trunc(-23.3)); // Output: -23
console.log(Math.floor(-23.3)); // Output: -24

// Rounding decimals
console.log((2.7).toFixed(0)); // Output: "3"
console.log((2.7).toFixed(3)); // Output: "2.700"
console.log((2.345).toFixed(2)); // Output: "2.35"
console.log(+(2.345).toFixed(2)); // Output: 2.35

// Remainder Operator
console.log(5 % 2); // Output: 1
console.log(5 / 2); // Output: 2.5
console.log(8 % 3); // Output: 1
console.log(8 / 3); // 8 = 2 * 3 + 2; Output: 2.666666665

console.log(6 % 2); // Output: 0
console.log(6 / 2); // Output: 3

console.log(7 % 2); // Output: 1
console.log(7 / 2); // Output: 3.5

const isEven = (n) => n % 2 === 0;
console.log(isEven(8));
console.log(isEven(23));
console.log(isEven(514));

labelBalance.addEventListener("click", function () {
  [...document.querySelectorAll(".movements__row")].forEach(function (row, i) {
    if (i % 2 === 0) row.style.backgroundColor = "orangered";
    if (i % 3 === 0) row.style.backgroundColor = "blue";
  });
});

// NOTE: Nth time -- use the remainder operator


// 287,460,000,000
const diameter = 287_460_000_000;
console.log(diameter);

const priceCents = 345_99;
console.log(priceCents);

const transferFee1 = 15_00;
const transferFee2 = 1_500;

const PI = 3.1415;
console.log(PI);

console.log(Number("230000"));
console.log(parseInt("230_000"));


// Working with BigInt

console.log(2 ** 53 - 1);
console.log(Number.MAX_SAFE_INTEGER);
console.log(2 ** 53 + 1);
console.log(2 ** 53 + 2);
console.log(2 ** 53 + 3);
console.log(2 ** 53 + 4);

console.log(465495919845165165198132166849165154949848n); // n converts the number to BigInt
console.log(BigInt(465495919845));

// Operations
console.log(10000n + 10000n);
console.log(321651564816565498168651651651651891961n * 1000n);
// console.log(Math.sqrt(16n));

const huge = 20289830237283728378237n;
const num = 23;
console.log(huge * BigInt(num));

console.log(20n > 15);
console.log(20n === 20);
console.log(typeof 20n);
console.log(20n == "20");
console.log(20n === "20");

console.log(huge + " is REALLY big!!!");

// Divisions
console.log(10n / 3n);
console.log(10 / 3);
*/

// Creating a date
/*
const now = new Date();
console.log(now);

console.log(new Date("Aug 19 2037 23:15:30"));
console.log(new Date("December 24, 2015"));
console.log(new Date("01-02-1997"));
console.log(new Date(2037, 10, 19, 15, 23, 5));
console.log(new Date(account1.movementsDates[0]));

console.log(new Date(2037, 10, 19, 15, 23, 5));
console.log(new Date(2037, 10, 31));

console.log(new Date(0)); // Unix Time
console.log(new Date(3 * 24 * 60 * 60 * 1000)); 


// Working with Dates
const future = new Date(2037, 10, 19, 15, 23, 5);
console.log(future);
console.log(future.getFullYear());
console.log(future.getMonth()); // Number from 0 to 11
console.log(future.getDate());
console.log(future.getDay());
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());
console.log(future.toISOString());
console.log(future.getTime());

console.log(new Date(future.getTime()));

console.log(Date.now());

future.setFullYear(2040);
console.log(future);


const future = new Date(2037, 10, 19, 15, 23, 5);
console.log(+future);

const calcDaysPassed = (date1, date2) =>
  Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);
console.log(calcDaysPassed(new Date(2037, 3, 14), new Date(2037, 3, 4)));


const num = 3884764.23;

// const options = {
//   style: "unit",
//   unit: "mile-per-hour",
// };
const options = {
  style: "currency",
  // unit: "mile-per-hour",
  currency: "EUR",
  useGrouping: true,
};

console.log("US:", new Intl.NumberFormat("en-US", options).format(num));
console.log("GER:", new Intl.NumberFormat("de-DE", options).format(num));
console.log("IN:", new Intl.NumberFormat("en-IN", options).format(num));


// setTimeout
const ingredients = ["olive", "chicken"];
const pizzaTimer = setTimeout(
  (ing1, ing2) => console.log(`Here's your pizza with ${ing1} and ${ing2}!🍕`),
  3000,
  ...ingredients
); // and then this but after 3 seconds

console.log("Waiting..."); // This executes first...

// All of these are happening due to call stack! When the call stack is empty
// then the event queue is executed and the timeout function is pushed unto the call
// stack for execution!

if (ingredients.includes("spinach")) clearTimeout(pizzaTimer);

// setInterval
setInterval(function () {
  const now = new Date();
  console.log(now);
}, 1000);
*/
