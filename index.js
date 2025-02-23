const puppeteer = require('puppeteer')
const cheerio = require('cheerio')
const Rx = require('rxjs');
const axios = require('axios')
const RxOp = require('rxjs/operators');
const mongoose = require('mongoose');


const csv = require('csv-parser')
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const results = [];

let ElectionPost;
let ErrorElectionPost

async function start() {
    try {
        //TODO: Update URL
        const url = "mongodb://localhost:27017/myDatabase"
        await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        const Schema = mongoose.Schema;
        const ObjectId = Schema.ObjectId;

        const ElectionPostSchema = new Schema({
            postal_code: String,
            city: String,
            province: String,
            time_zone: String,
            latitude: String,
            longitude: String,
            riding_name: String,
            riding_population: String,
            riding_register_voters: String,
            riding_polling_divisions: String
        });


        const ErrorElectionPostSchema = new Schema({
            postal_code: String,
            city: String,
            province: String,
            time_zone: String,
            latitude: String,
            longitude: String,
        });


        ElectionPost = mongoose.model('ElectionPost', ElectionPostSchema);
        ErrorElectionPost = mongoose.model('ErrorElectionPost', ErrorElectionPostSchema)

        readCsvFile();

    } catch(error) {
        console.log("Error: " + error)
        console.log("Process is exitting")
        process.exit(5)
    }

}


const csvWriter = createCsvWriter({
    path: 'file.csv',
    header: [
        {id: 'postal_code', title: 'POSTAL_CODE'},
        {id: 'city', title: 'CITY'},

        {id: 'province', title: 'PROVINCE_ABBR'},
        {id: 'time_zone', title: 'TIME_ZONE'},
        {id: 'latitude', title: 'LATITUDE'},
        {id: 'longitude', title: 'LONGITUDE'},
        {id: 'riding_name', title: 'RIDING_NAME' },
        {id: 'riding_population', title: 'RIDING_POPULATION'},
        {id: 'riding_register_voters', title:'RIDGING_REGISTER_VOTERS'},
        {id: 'riding_polling_divisions', title:'RIDING_POLLING_DIVISIONS'}
    ]
});


const csvErrorWriter = createCsvWriter({
    path: 'error.csv',
    header: [
        {id: 'postal_code', title: 'POSTAL_CODE'},
        {id: 'city', title: 'CITY'},

        {id: 'province', title: 'PROVINCE_ABBR'},
        {id: 'time_zone', title: 'TIME_ZONE'},
        {id: 'latitude', title: 'LATITUDE'},
        {id: 'longitude', title: 'LONGITUDE'},
    ]
});


async function fetchInfoFromElection_CA(postalCode) {
    
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.CHROME_BIN || null,
    args: ['--no-sandbox', '--headless', '--disable-gpu', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();

    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36")


    // Navigate the page to a URL.
    await page.goto('https://www.elections.ca/Scripts/vis/FindED?L=e&QID=-1&PAGEID=20&delay=1000');

    let element = await page.waitForSelector('input#CommonSearchTxt')
    await element.type(postalCode)
    await element.press('Enter')

    await page.waitForSelector('.VotingDates2')
    const url = page.url()

    let returnedHtml = await axios(url, {
      "headers": {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "en-CA,en;q=0.9",
        "cache-control": "max-age=0",
        "sec-ch-ua": "\"Not(A:Brand\";v=\"99\", \"Google Chrome\";v=\"133\", \"Chromium\";v=\"133\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "cookie": "cookiesession1=678B28678B01E62A0E99D35864CD8F7D; at_check=true; AMCVS_A90F2A0D55423F537F000101%40AdobeOrg=1; AMCV_A90F2A0D55423F537F000101%40AdobeOrg=-1124106680%7CMCIDTS%7C20142%7CMCMID%7C43547984961902985670593905498177015284%7CMCAAMLH-1740847981%7C9%7CMCAAMB-1740847981%7C6G1ynYcLPuiQxYZrsz_pkqfLG9yMXBpb2zX5dvJdYQJzPXImdj0y%7CMCOPTOUT-1740250381s%7CNONE%7CMCAID%7CNONE%7CMCSYNCSOP%7C411-20149%7CvVersion%7C5.2.0; gpv_pthl=blank%20theme; gpv_pc=Elections%20Canada; s_cc=true; ASPSESSIONIDCURQBDCQ=PGEDEJMADIFOKDPALODCDDJM; ASPSESSIONIDAUTRDBDR=PJKBIJMAHDLOHEFBKECPHIDH; ASP.NET_SessionId=i0w3djpvrxq4xlgoridzgpuz; mbox=session#c7152e6aa91049ff8e68f73a91822d51#1740245538|PC#c7152e6aa91049ff8e68f73a91822d51.34_0#1803488478; s_plt=0.35; gpv_pu=www.elections.ca%2Fscripts%2Fvis%2FFindED; gpv_pt=Voter%20Information%20Service%20-%20Find%20your%20electoral%20district; gpv_pqs=%3Fl%3De%26pageid%3D20; gpv_url=www.elections.ca%2Fscripts%2Fvis%2FFindED; s_ips=1262; s_tp=1400; s_ppv=Voter%2520Information%2520Service%2520-%2520Find%2520your%2520electoral%2520district%2C90%2C90%2C1262%2C1%2C1; s_sq=canadalivemain%3D%2526c.%2526a.%2526activitymap.%2526page%253DVoter%252520Information%252520Service%252520-%252520Find%252520your%252520electoral%252520district%2526link%253DSearch%2526region%253Dmain%2526pageIDType%253D1%2526.activitymap%2526.a%2526.c",
        "Referer": "https://www.elections.ca/scripts/vis/FindED?L=e&PAGEID=20",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      },
      "body": null,
      "method": "GET"
    });

    returnedHtml = await returnedHtml.data
    const $ = cheerio.load(returnedHtml);

    const postalCodeInformation = $.extract({
      votingData: [".VotingDates2"]
    })

    return { postalCodeInformation, postalCode };

  } catch(e) {
    console.log(e)
    return  {type: "Error", message: `Error fetching information of ${postalCode} from election.ca` }
  }

}

async function writeToCSV(i, data) {
    const date = new Date();
    const dateString = date.getMinutes()  + ":" + date.getSeconds() 
    data.time = dateString

    const {
        POSTAL_CODE:postal_code, 
        CITY: city,  
        PROVINCE_ABBR:province, 
        TIME_ZONE: time_zone, 
        LATITUDE: latitude, 
        LONGITUDE: longitude  } = data

    // POSTAL_CODE,CITY, PROVINCE_ABBR,TIME_ZONE,LATITUDE,LONGITUDE

    const returnedData = await fetchInfoFromElection_CA(postal_code) || {}  //2. Fetch information
    //{"postalCodeInformation":{"votingData":["Name: Vancouver South (British Columbia) ","Population: 109,339 ","Registered voters 74,785","Number of polling divisions: 186","Harjit S.  Sajjan","Get more information on your Member of Parliament (Parliamentary Web site).","The last election in your electoral district was a general election held on Monday, September 20, 2021.","See the list of candidates for the last election."]},"postalCode":"V5P1M5"}


    if (returnedData.type === "Error") {

        //TODO: Write to an error log....
        // await csvErrorWriter.writeRecords([{ postal_code, city, province, time_zone, latitude, longitude }])
        try {
            const errorElectionPost = new ErrorElectionPost({ postal_code, city, province, time_zone, latitude, longitude })
            await errorElectionPost.save()
        } catch(err) {
            console.error('Error:', err)
        }
        return;
    }

    console.log("-------------", returnedData.type)

    const {postalCodeInformation: { votingData }} = returnedData

    // Riding-Name, Riding-Population, Riding-Register-Voters, Riding-Number-of-Polling-Divisions
    const riding_name = votingData[0]
    const riding_population = votingData[1]
    const riding_register_voters = votingData[2]
    const riding_polling_divisions = votingData[3]

   
    
    try {
        const electionPost = new ElectionPost({ postal_code, city, province, time_zone, latitude, longitude, riding_name, riding_population, riding_register_voters, riding_polling_divisions})
        await electionPost.save()
    } catch(err) {
        console.error('Error:', err)
    }
    // await csvWriter.writeRecords([{ postal_code, city, province, time_zone, latitude, longitude, riding_name, riding_population, riding_register_voters, riding_polling_divisions}])


    console.log( i + "-------" + JSON.stringify(data) + dateString)
}



function readCsvFile() {
    //TODO: Change file
    // 'small_data.csv'
    // 'data.csv'
    fs.createReadStream('data.csv')
  .pipe(csv())
  .on('data', (data) => {
    results.push(data)
  })
  .on('end', async () => {

    // console.log(results);
    // const interval$ = Rx.interval(5000);
    // const items$ = Rx.from(results);
    // const itemsOverTime$ = Rx.zip(interval$, items$)//.pipe(RxOp.repeat());
    // itemsOverTime$.subscribe(([time, val]) => {
    // console.log(val + "----" +time);
    // writeToCSV(time, val)
    // });



    for (let i = 0; i< results.length; i++) {
        let id = setTimeout(()=> {
            writeToCSV(i, results[i])  // 2.................
            clearTimeout(id)
        }, i * 5000)
    }
    
  });

}




start()





