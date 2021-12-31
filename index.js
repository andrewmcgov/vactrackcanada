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
const population = 38246108;

async function getPercentages() {
  try {
    const res = await fetch(URL);
    const resData = await res.json();
    const data = resData.data[0];

    const atLeastOneDose = (
      ((data.total_vaccinations -
        data.total_vaccinated -
        data.total_boosters_1) /
        population) *
      100
    ).toFixed(2);

    const fullyVaccinated = (
      (data.total_vaccinated / population) *
      100
    ).toFixed(2);

    const boosted = ((data.total_boosters_1 / population) * 100).toFixed(2);

    return {atLeastOneDose, fullyVaccinated, boosted};
  } catch (err) {
    console.error(err);
  }
}

function getTweetText(percentage, doseType) {
  const completedSteps = percentage / stepPercentage;
  let text = '';
  let startText;

  switch (doseType) {
    case 'partial':
      startText = 'Canadians with at least one dose: \n';
      break;
    case 'full':
      startText = 'Canadians fully vaccinated: \n';
      break;
    case 'boosted':
      startText = 'Canadians boosted: \n';
      break;
    default:
      break;
  }

  stepArray.forEach((currentStep) => {
    if (currentStep < completedSteps) {
      text = text + full;
    } else if (currentStep - 0.5 < completedSteps) {
      text = text + partial;
    } else {
      text = text + empty;
    }
  });

  return startText + text + ` ${percentage}%`;
}

async function main() {
  const {atLeastOneDose, fullyVaccinated, boosted} = await getPercentages();
  const atLeastOneDoseText = getTweetText(atLeastOneDose, 'partial');
  const fullyVaccinatedText = getTweetText(fullyVaccinated, 'full');
  const boostedText = getTweetText(boosted, 'boosted');
  const tweetText =
    atLeastOneDoseText +
    '\n\n' +
    fullyVaccinatedText +
    '\n\n' +
    boostedText +
    '\n\n#COVID19Canada #vaccine #getboosted';

  try {
    T.post(
      'statuses/update',
      {status: tweetText},
      function (err, data, response) {
        if (err) {
          console.log('Error posting tweet.');
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
