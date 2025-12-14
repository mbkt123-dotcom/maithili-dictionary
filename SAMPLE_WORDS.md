# Sample Words for Testing

## Overview

This document describes the sample words added to the database for testing purposes. These words will be removed before deployment.

## Adding Sample Words

To add 50 sample words to the database:

```bash
npm run db:seed:sample-words
```

## Removing Sample Words

To remove all sample words before deployment:

```bash
npm run db:remove:sample-words
```

## Sample Words Included

The script adds 50 common Maithili words covering:

### Greetings & Common Words (2)
- नमस्कार (namaskar) - Greeting, hello
- धन्यवाद (dhanyavad) - Thank you

### Basic Nouns (20)
- पानी (pani) - Water
- खाना (khana) - Food
- घर (ghar) - House, home
- माँ (ma) - Mother
- बाबू (babu) - Father
- भाई (bhai) - Brother
- बहिन (bahin) - Sister
- किताब (kitab) - Book
- स्कूल (school) - School
- शिक्षक (shikshak) - Teacher
- विद्यार्थी (vidyarthi) - Student
- सूर्य (surya) - Sun
- चंद्रमा (chandrama) - Moon
- तारा (tara) - Star
- पेड़ (ped) - Tree
- फूल (phul) - Flower
- पक्षी (pakshi) - Bird
- कुत्ता (kutta) - Dog
- बिल्ली (billi) - Cat
- गाय (gay) - Cow
- हाथी (hathi) - Elephant
- रंग (rang) - Color
- समय (samay) - Time
- दिन (din) - Day
- रात (rat) - Night
- प्रेम (prem) - Love
- मित्र (mitra) - Friend

### Adjectives (7)
- सुंदर (sundar) - Beautiful
- बड़ा (bada) - Big, large
- छोटा (chhota) - Small
- अच्छा (accha) - Good
- बुरा (bura) - Bad
- गर्म (garm) - Hot
- ठंडा (thanda) - Cold

### Verbs (15)
- जाना (jana) - To go
- आना (ana) - To come
- पीना (pina) - To drink
- सोना (sona) - To sleep
- उठना (uthna) - To wake up, to get up
- बोलना (bolna) - To speak
- सुनना (sunna) - To listen, to hear
- देखना (dekhna) - To see, to look
- पढ़ना (padhna) - To read, to study
- लिखना (likhna) - To write
- करना (karna) - To do
- मिलना (milna) - To meet, to get
- देना (dena) - To give
- लेना (lena) - To take

## Word Properties

Each sample word includes:
- **Word in Maithili** (Devanagari script)
- **Romanized form** (Latin script)
- **Pronunciation** (IPA notation)
- **Word Type** (noun, verb, adjective)
- **Meanings** in English and Hindi

## Status

All sample words are created with:
- Status: `PUBLISHED`
- Is Published: `true`
- Is Concise: `true`
- Dictionary: Main Dictionary (MLRC)

## Notes

- These words are for **testing purposes only**
- They should be **removed before production deployment**
- The removal script identifies words by their romanized form
- Words are linked to the main dictionary only
- All words have meanings in both English and Hindi

## Before Deployment Checklist

- [ ] Run `npm run db:remove:sample-words` to remove all sample words
- [ ] Verify no sample words remain in the database
- [ ] Test that the application still works correctly
- [ ] Proceed with deployment

