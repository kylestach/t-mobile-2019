import requests
import sys
import json
from keywordExtraction import extract_query

class Link:
    def __init__(self, name, desc, link):
        self.name = name
        self.desc = desc
        self.link = link
    def __repr__(self):
        return '{"name": "%s", "desc": "%s", "link": "%s"}'% (self.name, self.desc, self.link)

def parseResponse(response):
    if(response):
        resp = response.text
        resp = resp.split("\n",1)[1]
        respJSON = json.loads(resp)
        list = respJSON['list']
        results = []
        for item in list:
            #print(item)
            link = item['resources']['html']['ref']
            name = item['parentPlace']['name']
            desc = None
            if 'description' in item:
                desc = item['description']
            results.append(Link(name,desc,link))
        return results
    else:
        print("Error getting tmobile main data")
        return None

def getArticles(keywords):
    newList1 = []
    newList2 = []
    newList = []
    for keyword in keywords:
        responseTmobileMain = requests.get('https://support.t-mobile.com/api/core/v3/search/places?sort=relevanceDesc&count=5&filter=search(%s)&filter=type(space,group,project)&fields=resources.html,resources.avatar,placeID,name,tags,parentPlace,description'% keyword.replace(" ","%20"))
        responseTmobileSupport = requests.get('https://support.t-mobile.com/api/core/v3/search/contents?sort=relevanceDesc&count=10&filter=search(%s)&fields=resources.html,subject,tags,highlightBody,highlightSubject,parentPlace,contentID,resolved&collapse=true&filter=type(document,file,post,discussion)&filter=community(2153)'% keyword.replace(" ","%20"))
        list1 = parseResponse(responseTmobileMain)
        list2 = parseResponse(responseTmobileSupport)
        if((list1 == None) and (list2 == None)):
            continue
        if(list1 == None):
            for i in range(0,min(10,len(list1))):
                newList2.append(list2[i])
            continue
        if(list2 == None):
            for i in range(0,min(10,len(list1))):
                newList1.append(list1[i])
            continue
        
        for i in range(0,min(5,len(list1))):
            newList1.append(list1[i])

        for i in range(0,min(5,len(list2))):
            newList2.append(list2[i])
    #print(newList1)
    #print(newList2)
    for i in newList2:
        newList1.append(i)
    return newList1


def parseRecuests(text):
    return getArticles(extract_query(text))


if __name__ == '__main__':
    print(str(getArticles(sys.argv[1:])))