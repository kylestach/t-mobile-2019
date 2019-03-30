import json
import string
from bs4 import BeautifulSoup
import sys
from nltk.corpus import stopwords

# Uses stopwords for english from NLTK, and all punctuation characters by
# default

keywords = {}
references = {}
word_list = ""


def get_html(name):
    with open('docs/{}'.format(name), 'r') as file:
        html = file.read()
    return html


def load_dict_json(path):
    with open(path, 'r') as file:
        references = json.load(file)
    file.close()
    return references


def save_dict_json(path):
    with open(path, 'w') as file:
        json.dump(keywords, file)
    file.close()


def get_reference_titles():
    with open('docs/titles.txt', 'r') as file:
        for line in file:
            titles = line[2:].split(':', 1)
            titles[1] = titles[1].replace('\n', '').strip()
            references[titles[0]] = titles[1]
    file.close()


def get_reference_article_text(name):
    text = ''
    html = get_html(name)
    if html:
        text = BeautifulSoup(html, 'html.parser').get_text()
    return text


def extract_dictionary(text):
    text = text.replace('\u201d', '').replace('\u201c', '').replace('\u00ae', '').replace('\u2019', '').replace('\u2122', '').replace('\u00a0', ' ').replace('\n', ' ')
    text = text.translate(str.maketrans('', '', string.punctuation))
    words = text.split(' ')

    for word in words:
        word = word.strip()
        word = word.lower()
        if word and len(word) < 20 and word not in stopwords.words('english'):
            if word not in keywords:
                keywords[word] = 0
            else:
                keywords[word] += 1


def extract_query(text):
    """Extracts search query from text"""
    allowed = load_dict_json('wordVectorData/titles_cleaned.json')
    query = []
    text = text.translate(str.maketrans('', '', string.punctuation))
    words = text.split(' ')
    for word in words:
        if word in allowed:
            query += [word]

    return query


def clean_dictionary():
    item = load_dict_json('wordVectorData/dict.json')
    words = ""
    for name in item.keys():
        if item[name] > 100:
            keywords[name] = item[name]

    save_dict_json('wordVectorData/dict_100.json')



 # Extraction given the text.

#
# # Extraction given the list of strings where each string is a sentence.
# r.extract_keywords_from_sentences("")

# To get keyword phrases ranked highest to lowest.
# # To get keyword phrases ranked highest to lowest with scores.
# r.get_ranked_phrases_with_scores()


if len(sys.argv) > 1:
    print(extract_query(sys.argv[1]))

# get_reference_titles()
# for name, description in references.items():
#     # extract_dictionary(get_reference_article_text(name))
#     extract_dictionary(description)
#
# with open("wordVectorData/dictionary.txt", 'w') as file:
#     for item in keywords.keys():
#         file.write("%s," % item)
# file.close()
# save_dict_json('wordVectorData/titles_cleaned.json')
# clean_dictionary()
