import sys
from rake_nltk import Rake

# Uses stopwords for english from NLTK, and all punctuation characters by
# default

def extract_keywords(text):
    r = Rake()
    r.extract_keywords_from_text(text)
    return r.get_ranked_phrases()

 # Extraction given the text.

#
# # Extraction given the list of strings where each string is a sentence.
# r.extract_keywords_from_sentences("")

# To get keyword phrases ranked highest to lowest.
# # To get keyword phrases ranked highest to lowest with scores.
# r.get_ranked_phrases_with_scores()


if len(sys.argv) > 1:
    print(extract_keywords(sys.argv[1]))
