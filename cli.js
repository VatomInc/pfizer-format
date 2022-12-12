#!/usr/bin/env node

const fs = require("fs");
const { parse } = require("csv-parse");

// Grab provide args.
const [,,  ...args] = process.argv

let fileType = args[0].split('.').pop();

if(fileType != 'csv' && fileType != 'json') {
    return console.log("File type not accepted. Please use a json or csv file.")
}

if(fileType == 'csv') {

    let objects = []
    const charsToRemove = ['[', ']', '"']

    // Parse csv file
    fs.createReadStream(args[0])
    .pipe(parse({ delimiter: ",", from_line: 2 }))
    .on("data", function (row) {
        
        let obj = {
            id: row[0] ,
            score: row[1],
            created_at: row[2],
            email: row[3],
            name: row[4],
            phone: row[5].slice(-10),
            jingleball_age: row[6],
            jingleball_zip: row[7],
            jingleball_content_1: removeAllChars(row[8], charsToRemove),
            jingleball_content_2: removeAllChars(row[9], charsToRemove),
        }

        // Skip entries with no data (determined by checking for name)
        if(obj.name && obj.name != ''){
            objects.push(obj)
        }

    })
    .on("error", function (error) {
      console.log(error.message);
    })
    .on("end", function () {
      
        let save = args[1]

        // Once finished parsing, format data
        pfizerFormat(objects, save)

    });

    
}

if(fileType == 'json') {

    let objects = require(args[0])
    let save = args[1]

    // Filter out entries with no data (determined by checking for name)
    objects = objects.filter(o => o.name)

    // Format data
    pfizerFormat(objects, save)

}

/** Convert data to pfizer format */
function pfizerFormat(objects, save) {

    let pfizerFormat = []

    // Get current date and time in correct format
    let currentDate = new Date()
    
    let day = currentDate.getDate() >= 10 ? currentDate.getDate() : `0${currentDate.getDate()}`
    let month = currentDate.getMonth() >= 10 ? currentDate.getMonth()+1 : `0${currentDate.getMonth()+1}`
    let year = currentDate.getFullYear()
    let today = `${year}${month}${day}`

    let hours = currentDate.getHours() >=10 ? currentDate.getHours() : `0${currentDate.getHours()}`
    let minutes = currentDate.getMinutes() >= 10 ? currentDate.getMinutes() : `0${currentDate.getMinutes()}`
    let seconds = currentDate.getSeconds() >= 10 ? currentDate.getSeconds() : `0${currentDate.getSeconds()}`
    let time = `${hours}${minutes}${seconds}`

    
    // Iterate through data, parse and format
    for(let obj of objects) {

        // Get random 10 digit number
        let randomDigits = Math.floor(Math.random() * 9000000000) + 1000000000;

        // Construct transaction ID
        let transactionID = '221000'+month+day+year+randomDigits

        // Get date of data creation
        let createdAt = obj.created_at.split('T')
        createdAt = createdAt[0].replaceAll('-','')

        // Instantiate answers array
        let answers = []    
    
        if(obj.name){
            let name = obj.name.split(" ")
            
            let data = {question: 'Q10005', answer: 'A10005', value: name[0]}
            answers.push(data)
    
            data = {question: 'Q10007', answer: 'A10007', value: name[1]}
            answers.push(data)
        }
    
        if(obj.email){
            let data = {question: 'Q10015', answer: 'A10015', value: obj.email}
            answers.push(data)
        }

        if(obj.phone){
            let data = {question: 'Q14556', answer: 'A22765', value: obj.phone}
            answers.push(data)
        }
    
        if(obj.jingleball_age){
            let data = {question: 'Q50118', answer: 'A50256', value: obj.jingleball_age}
            answers.push(data)
        }
    
        if(obj.jingleball_zip){
            let data = {question: 'Q10021', answer: 'A10021', value: obj.jingleball_zip}
            answers.push(data)
        }
    
        if(obj.jingleball_content_1) {
            let content = obj.jingleball_content_1.split(',')
            for(let c of content){
                if (c === 'undisclosed') {
                    answers.push({question: 'Q50115', answer: 'A50253', value: 'Yes'})
                    break
                }
                let data = {question: 'Q50111', answer: getAnswerCode(c), value: c}
                answers.push(data)
            }
        }
            
    
        if(obj.jingleball_content_2) {
            let content = obj.jingleball_content_2.split(',')
            for(let c of content){
                if (c === 'undisclosed') {
                    answers.push({question: 'Q50116', answer: 'A50254', value: 'Yes'})
                    break
                }
                
                let data = {question: 'Q50112', answer: getAnswerCode(c), value: c}
                answers.push(data)
            }
        }

        answers.push({question: 'Q50061', answer: 'A50132', value: 'NI'})
    
        if(answers.length > 0) {
            for(let answer of answers) {
                let pfizer = ''
                pfizer += 'VAT|'
                pfizer += `${createdAt}|`
                pfizer += 'COMI11004325|'
                pfizer += `${transactionID}|`
                pfizer += 'S50009|'
                pfizer += `${answer.question}|`
                pfizer += `${answer.answer}|`
                pfizer += `${answer.value}|`
    
                pfizerFormat.push(pfizer)
            }
        }
       
    }
    
    // Add header and trailer
    let headerTrailer = `VAT|${objects.length}|${pfizerFormat.length}|${today}|${time}|`
    pfizerFormat.unshift(headerTrailer)
    pfizerFormat.push(headerTrailer)
    
    // Create string from data
    let pfizerString = ''
    for(let pfizer of pfizerFormat){
        pfizerString += `${pfizer}\n`
    }
    
    // Print out formatted data
    console.log(pfizerString)
    
    // Save to text file
    if(save == 's'){
        let fileName = `PFIZ_VAT_CHNLIN_${today}.txt`
        const fs = require('fs');
        fs.writeFileSync(fileName, pfizerString);
    }
    
}

/** Remove all all chars from as sting */
function removeAllChars(string, chars){
    for(let char of chars){
        string = string.replaceAll(char, '')
    }
    return string
}

/** Get hardcoded answer code based on survey answer */
function getAnswerCode(answer){
    
    answer = answer.toLowerCase()

    if(answer == '65+'){
        return 'A50240'
    }

    if(answer == '18-64'){
        return 'A50241'
    }

    if(answer == '12-17'){
        return 'A50242'
    }

    if(answer == '5-11'){
        return 'A50243'
    }

    if(answer == '6m-4'){
        return 'A50244'
    }

    if(answer == 'immunocompromised'){
        return 'A50245'
    }

    if(answer == 'primary'){
        return 'A50246'
    }

    if(answer == 'booster'){
        return 'A50247'
    }
}
