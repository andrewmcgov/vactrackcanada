import fetch from 'node-fetch';
import dotenv from 'dotenv';
import Twit from 'twit';

const URL = 'https://api.covid19tracker.ca/summary';

dotenv.config();

const T = new Twit({
  consumer_key: process.env.API_KEY,
  consumer_secret: process.env.API_SECRET_KEY,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
});

const full = '▓';
const partial = '▒';
const empty = '░';
const length = 15;
const stepArray = [...Array(length).keys()].map((el) => el + 1);
const stepPercentage = 100 / length;

async function getPercentage() {
  try {
    const res = await fetch(URL);
    const resData = await res.json();
    const data = resData.data[0];

    const percentage = (
      ((data.total_vaccinations - data.total_vaccinated) / 38008005) *
      100
    ).toFixed(2);

    return percentage;
  } catch (err) {
    console.error(err);
  }
}

function getTweetText(percentage) {
  const completedSteps = percentage / stepPercentage;
  let text = '';

  stepArray.forEach((currentStep) => {
    if (currentStep < completedSteps) {
      text = text + full;
    } else if (currentStep - 0.5 < completedSteps) {
      text = text + partial;
    } else {
      text = text + empty;
    }
  });

  return 'Canadians with at least one dose: \n\n' + text + ` ${percentage}%`;
}

async function main() {
  const percentage = await getPercentage();
  const tweetText = getTweetText(percentage);

  try {
    T.post(
      'statuses/update',
      {status: tweetText},
      function (err, data, response) {
        if (err) {
          console.log(err);
        } else {
          console.log('Tweet posted!');
        }
      }
    );
  } catch (error) {
    console.error(error);
  }
}

main();
