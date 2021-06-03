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
const population = 38008005;

async function getPercentages() {
  try {
    const res = await fetch(URL);
    const resData = await res.json();
    const data = resData.data[0];

    const atLeastOneDose = (
      ((data.total_vaccinations - data.total_vaccinated) / population) *
      100
    ).toFixed(2);

    const fullyVaccinated = (
      (data.total_vaccinated / population) *
      100
    ).toFixed(2);

    return {atLeastOneDose, fullyVaccinated};
  } catch (err) {
    console.error(err);
  }
}

function getTweetText(percentage, fullyVaccinated) {
  const completedSteps = percentage / stepPercentage;
  let text = '';
  const startText = fullyVaccinated
    ? 'Canadians fully vaccinated: \n\n'
    : 'Canadians with at least one dose: \n\n';

  stepArray.forEach((currentStep) => {
    if (currentStep < completedSteps) {
      text = text + full;
    } else if (currentStep - 0.5 < completedSteps) {
      text = text + partial;
    } else {
      text = text + empty;
    }
  });

  return startText + text + ` ${percentage}%` + '\n\n#COVID19 #COVID19Canada';
}

async function main() {
  const {atLeastOneDose, fullyVaccinated} = await getPercentages();
  const atLeastOneDoseText = getTweetText(atLeastOneDose, false);
  const fullyVaccinatedText = getTweetText(fullyVaccinated, true);

  try {
    T.post(
      'statuses/update',
      {status: atLeastOneDoseText},
      function (err, data, response) {
        if (err) {
          console.log('Error posting at least one dose tweet.');
          console.log(err);
        } else {
          console.log('At least one dose tweet posted!');
        }
      }
    );
    T.post(
      'statuses/update',
      {status: fullyVaccinatedText},
      function (err, data, response) {
        if (err) {
          console.log('Error posting fully vaccinated tweet.');
          console.log(err);
        } else {
          console.log('Fully vaccinated tweet posted!');
        }
      }
    );
  } catch (error) {
    console.error(error);
  }
}

main();
