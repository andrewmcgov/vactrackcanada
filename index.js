import fetch from 'node-fetch';
const URL = 'https://api.covid19tracker.ca/summary';

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

  return text + ` ${percentage}%`;
}

async function main() {
  const percentage = await getPercentage();
  const tweetText = getTweetText(percentage);

  console.log(tweetText);
}

main();
