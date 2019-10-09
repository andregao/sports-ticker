const sampleData = [
  {
    id: 5,
    name: 'MLB',
    provider_value: 'sr:tournament:109',
    matches: [
      {
        id: 20599,
        name: 'Pittsburgh Pirates VS Philadelphia Phillies',
        schedule: '2019-08-27T23:05:00+00:00',
        home_abbreviation: 'PHI',
        away_abbreviation: 'PIT',
        odds: {
          home_ml: -147,
          favourite_team: 'PHI',
          spread: '1.5',
          total: '10',
          away_ml: '+125'
        }
      },
      {
        id: 20610,
        name: 'Baltimore Orioles VS Washington Nationals',
        schedule: '2019-08-27T23:05:00+00:00',
        home_abbreviation: 'WSH',
        away_abbreviation: 'BAL',
        odds: {
          total: '9.5',
          home_ml: -333,
          favourite_team: 'WSH',
          spread: '1.5',
          away_ml: '+265'
        }
      },
      {
        id: 20601,
        name: 'Chicago Cubs VS New York Mets',
        schedule: '2019-08-27T23:10:00+00:00',
        home_abbreviation: 'NYM',
        away_abbreviation: 'CHC',
        odds: {
          total: '8',
          away_ml: -116,
          favourite_team: 'CHC',
          spread: '1.5',
          home_ml: -105
        }
      },
      {
        id: 20604,
        name: 'Cleveland Indians VS Detroit Tigers',
        schedule: '2019-08-27T23:10:00+00:00',
        home_abbreviation: 'DET',
        away_abbreviation: 'CLE',
        odds: {
          favourite_team: 'CLE',
          spread: '1.5',
          total: '9.5',
          home_ml: '+145',
          away_ml: -167
        }
      },
      {
        id: 20600,
        name: 'Cincinnati Reds VS Miami Marlins',
        schedule: '2019-08-27T23:10:00+00:00',
        home_abbreviation: 'MIA',
        away_abbreviation: 'CIN',
        odds: {
          total: '7',
          away_ml: -161,
          favourite_team: 'CIN',
          spread: '1.5',
          home_ml: '+140'
        }
      }
    ]
  },
  {
    id: 1,
    name: 'NFL',
    provider_value: 'sr:tournament:233',
    matches: [
      {
        id: 20426,
        name: 'Pittsburgh Steelers VS Carolina Panthers',
        schedule: '2019-08-29T23:00:00+00:00',
        home_abbreviation: 'CAR',
        away_abbreviation: 'PIT',
        odds: {
          total: '33',
          home_ml: '+155',
          away_ml: -175,
          favourite_team: 'PIT',
          spread: '3.5'
        }
      },
      {
        id: 20429,
        name: 'Philadelphia Eagles VS New York Jets',
        schedule: '2019-08-29T23:00:00+00:00',
        home_abbreviation: 'NYJ',
        away_abbreviation: 'PHI',
        odds: {
          favourite_team: 'NYJ',
          spread: '4',
          total: '35',
          home_ml: -200,
          away_ml: '+170'
        }
      },
      {
        id: 20430,
        name: 'Atlanta Falcons VS Jacksonville Jaguars',
        schedule: '2019-08-29T23:00:00+00:00',
        home_abbreviation: 'JAC',
        away_abbreviation: 'ATL',
        odds: {
          home_ml: -200,
          total: '32',
          away_ml: '+170',
          favourite_team: 'JAC',
          spread: '4'
        }
      },
      {
        id: 20428,
        name: 'Indianapolis Colts VS Cincinnati Bengals',
        schedule: '2019-08-29T23:00:00+00:00',
        home_abbreviation: 'CIN',
        away_abbreviation: 'IND',
        odds: {
          favourite_team: 'CIN',
          spread: '3',
          total: '33.5',
          home_ml: -156,
          away_ml: '+135'
        }
      },
      {
        id: 20427,
        name: 'Minnesota Vikings VS Buffalo Bills',
        schedule: '2019-08-29T23:00:00+00:00',
        home_abbreviation: 'BUF',
        away_abbreviation: 'MIN',
        odds: {
          home_ml: '+135',
          total: '35',
          away_ml: -156,
          favourite_team: 'MIN',
          spread: '3'
        }
      }
    ]
  }
];

// const tickerContainer = document.querySelector('.ticker-container');
const ticker = document.querySelector('.ticker');
const startButton = document.querySelector('.button.start');
const stopButton = document.querySelector('.button.stop');
const blockButton = document.querySelector('.button.block');
const blockMessage = document.querySelector('.block-message');

// listen for animation end event to reset ticker position in the next loop
ticker.addEventListener('animationend', handleAnimationEnd);

// get reference to animation parameters in CSS file
const keyframesRules = getKeyframesRules();

// initialize ticker position
setTickerPosition(window.innerWidth || 400);

// set flag to handle in case of window resize before starting
let firstRun = true;

// window resize should reset animation parameters
window.onresize = handleResize;
let timeoutRefResize;
let isRunning = false;

// hue animation to be blocked by main thread as demo
let intervalRef;
animateButton(blockButton);

// blocking notification timeout reference
let timeoutRef;

// dataset selection radio buttons
document
  .querySelector('.radio-buttons')
  .addEventListener('change', handleSwitch);

// prevent memory leak
window.addEventListener('beforeunload', clearRefs);

loadData('MLB');

function handleStart() {
  styleButtons(true);
  if (firstRun) {
    setFirstRun(false);
    resetAnimation();
  }
  animate(true);
}

function handleStop() {
  styleButtons(false);
  setAnimationRules(ticker.getBoundingClientRect().left);
  animate(false);
}

function handleReload() {
  animate(false);
  resetAnimation();
  setFirstRun(true);
  styleButtons(false);
}

function handleBlock() {
  timeoutRef !== undefined && clearTimeout(timeoutRef);
  const time = heavyCalculation();
  blockMessage.innerText = `Main Thread Blocked for ${time}ms`;
  timeoutRef = setTimeout(() => (blockMessage.innerText = ''), 5000);
}

function handleSwitch({ target: { value } }) {
  loadData(value);
  handleReload();
}

function handleAnimationEnd() {
  animate(false);
  resetAnimation();
  animate(true);
}

function handleResize() {
  // debounce and reset animation parameters
  clearTimeout(timeoutRefResize);

  function onResize() {
    const position = ticker.getBoundingClientRect().left;
    setTickerPosition(position);
    ticker.style.animationName = 'none';
    setAnimationRules(position);
    isRunning && animate(true);
  }

  timeoutRefResize = setTimeout(onResize, 300)
}

// helpers
function styleButtons(isStarting) {
  startButton.disabled = isStarting;
  stopButton.disabled = !isStarting;
}

function animate(isStarting) {
  ticker.style.animationName = isStarting ? 'tickerKeyframes' : 'none';
  isRunning = isStarting;
}

function setAnimationRules(startingPosition) {
  setTickerPosition(startingPosition);
  // calculate new distance
  const travelDistance =
    ticker.offsetWidth +
    window.innerWidth -
    (window.innerWidth - startingPosition);

  keyframesRules.deleteRule('100%');
  keyframesRules.appendRule(
    `100% { transform: translateX(${-travelDistance}px);}`
  );
  // calculate new duration to keep constant speed: 140px per second
  const duration = travelDistance / 140;
  ticker.style.animationDuration = `${duration}s`;
  ticker.style.animationIterationCount =
    startingPosition === window.innerWidth ? 'infinite' : '1';
}

function resetAnimation() {
  setAnimationRules(window.innerWidth);
}

function getKeyframesRules() {
  const stylesheet = document.styleSheets[0];
  for (let rule of stylesheet.cssRules) {
    if (rule.name === 'tickerKeyframes') {
      return rule;
    }
  }
}

function setTickerPosition(position) {
  ticker.style.left = `${position}px`;
}

function setFirstRun(isFirstRun) {
  firstRun = isFirstRun;
  ticker.style.display = isFirstRun ? 'none' : 'block';
}

function heavyCalculation() {
  const timestamp = Date.now();
  for (let i = 0; i < 100000; i++) {
    for (let j = 0; j < i; j++) {
      const n = j ^ i;
    }
  }
  return Date.now() - timestamp;
}

function animateButton(button) {
  let degree = 0;

  function changeHue(n) {
    degree > 360 && (degree = degree - 360);
    degree += n;
    button.style.filter = `hue-rotate(${degree}deg)`;
  }

  intervalRef = setInterval(() => changeHue(15), 50);
}

function loadData(group) {
  const tickerFragment = document.createDocumentFragment();

  const { matches } = sampleData.find(item => item.name === group);
  matches.map(
    ({
       name,
       home_abbreviation,
       away_abbreviation,
       odds: { away_ml, home_ml, spread, total }
     }) => {
      const itemFragment = document.createDocumentFragment();
      appendNewElement(itemFragment, 'span', name);
      appendNewElement(
        itemFragment,
        'span',
        home_abbreviation,
        'ticker-item-title'
      );
      appendNewElement(itemFragment, 'span', home_ml, 'ticker-item-number');
      appendNewElement(
        itemFragment,
        'span',
        away_abbreviation,
        'ticker-item-title'
      );
      appendNewElement(itemFragment, 'span', away_ml, 'ticker-item-number');
      appendNewElement(itemFragment, 'span', 'SPREAD', 'ticker-item-title');
      appendNewElement(itemFragment, 'span', spread, 'ticker-item-number');
      appendNewElement(itemFragment, 'span', 'TOTAL', 'ticker-item-title');
      appendNewElement(itemFragment, 'span', total, 'ticker-item-number');

      const tickerItem = document.createElement('span');
      tickerItem.className = 'ticker-item';
      tickerItem.appendChild(itemFragment);
      tickerFragment.appendChild(tickerItem);
    }
  );
  while (ticker.lastChild) {
    ticker.removeChild(ticker.lastChild);
  }
  ticker.appendChild(tickerFragment);
}

function clearRefs() {
  timeoutRef !== undefined && clearTimeout(timeoutRef);
  intervalRef !== undefined && clearInterval(intervalRef);
}

function appendNewElement(fragment, type, text, className) {
  const el = document.createElement(type);
  el.innerText = text;
  className && (el.className = className);
  fragment.appendChild(el);
}
