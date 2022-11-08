#!/usr/bin/env node

// Grab provide args.
const [,,  ...args] = process.argv

let objects = require(args[0])
let save = args[1]

let pfizerFormat = []

let currentDate = new Date()
let day = currentDate.getDay() >= 10 ? currentDate.getDay() : `0${currentDate.getDay()}` 
let today = `${currentDate.getFullYear()}${currentDate.getMonth()}${day}`
let headerTrailer = `VAT|${objects.length}|${today}|120000|`
pfizerFormat.push(headerTrailer)

// Formate Data
for(let obj of objects){

    let dateTime = obj.created_at.split('T')
    let date = dateTime[0].replaceAll('-','')
    let yearMonthDay = dateTime[0].split('-') 
    let time = dateTime[1].replaceAll(':', '').replaceAll('.', '').slice(0, -1)
    let transactionID = '221000'+yearMonthDay[1]+yearMonthDay[2]+yearMonthDay[0]+time+Math.floor(Math.random() * 10);

    let answers = []

    if(obj.id){
        let data = {question: 'Q10003', answer: 'A10003', value: obj.id}
        answers.push(data)
    }

    if(obj.name){
        let name = obj.name.split(" ")
        
        let data = {question: 'Q10005', answer: 'A10005', value: name[0]}
        answers.push(data)

        data = {question: 'Q10007', answer: 'A10007', value: name[1]}
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
        let data = {question: 'Q50111', answer: 'A50241', value: obj.jingleball_content_1}
        answers.push(data)
    }

    if(obj.jingleball_content_2) {
        let data = {question: 'Q50112', answer: 'A50246', value: obj.jingleball_content_2}
        answers.push(data)
    }

    if(answers.length > 0) {
        for(let answer of answers) {
            let pfizer = ''
            pfizer += 'VAT|'
            pfizer += `${date}|`
            pfizer += 'COMI11004201|'
            pfizer += `${transactionID}|`
            pfizer += 'S50009|'
            pfizer += `${answer.question}|`
            pfizer += `${answer.answer}|`
            pfizer += `${answer.value}|`

            pfizerFormat.push(pfizer)
        }
    }
   
}

pfizerFormat.push(headerTrailer)

// Create string from data
let pfizerString = ''
for(let pfizer of pfizerFormat){
    pfizerString += `${pfizer}\n`
}

// Log it
console.log(pfizerString)

// Save to text file
if(save == 's'){
    let fileName = `PFIZ_VAT_CHNLIN_${today}`
    const fs = require('fs');
    fs.writeFileSync(fileName, pfizerString);
}