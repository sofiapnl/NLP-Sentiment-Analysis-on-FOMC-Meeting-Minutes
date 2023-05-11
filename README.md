# NLP-Sentiment-Analysis-on-FOMC-Meeting-Minutes
This project suggests applying NLP to the Federal Open Market Committee (FOMC) meeting minutes.
The Federal Reserve has been increasing interest rates to battle historically high inflation after the COVID-19 pandemic stimulus package.
The commission that decides to do this is known as the FOMC - Federal Open Market Committee. They meet and release the minutes from the meeting before announcing their decision. 
For any participants in the fixed income trading market, the analysis and subsequent prediction of where interest rates go would be of extreme interest. 
So by implementing an NLP pipeline on the minutes, observations that may assist in making portfolio decisions can be discovered.

# Data Description
The data is officially sourced from the Federal Reserve website. 
The time period obtained ranges from 2003 to 2023, representing 20 years of FOMC meeting minutes.
As there are about 8 meetings a year, there are roughly 160 documents that need to be combed and processed. 
The methodology undertaken in the experiment was to utilize web scraping python packages to parse the HTML pages. 
However, as there were large volumes of text of all sizes, it was determined that the documents proved too cumbersome for efficient input into the models.
Thus, only paragraphs over 200 characters were ingested into the dataset. This was useful for cases where the raw text data contained large amounts of extraneous information or noise, 
and only the long and informative paragraphs of interest were retained. Smaller sizes tended to just be cursory information about meeting participants or otherwise irrelevant phrases.
Still, the total number of text instances amounted to almost 27,000 rows after processing and cleaning. 

The preparation done sought to perform common preprocessing steps on text data, including removing punctuation and special characters, converting to lowercase, tokenizing, removing stop words, and joining the words back into a single string. 
Another action done was replacing any newline characters and non-breaking spaces in the text with a single space, making the text easier to process. 
These steps are often necessary to clean and standardize text data before performing more advanced natural language processing tasks.

# How to Install and Run the Project
Download the ipnyb files and run the cells. Alternatively, if one wishes not to run all the models on the data, then the pickle files provided may be used for the FinBERT analysis.
One should download the .js and .css files on their colab notebook google drives in order to run the viualizations.

