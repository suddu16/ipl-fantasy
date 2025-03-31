#!/usr/bin/env python
# coding: utf-8

# In[13]:


import pandas as pd
from pprint import pprint
from bs4 import BeautifulSoup
import io

pd.set_option('display.max_colwidth', 200)
pd.set_option('display.max_columns',None) #display all columns
pd.set_option('display.max_rows',None) #display all rows

# Required Input files
# When running for the very first time, `ipl2025_results.csv`` file is required with all the team managers and an initial row of 0s.
# IPL2025MockAuctionSummary.csv file is required with each of the managers, their teams and their players listed.

# Dependencies to install
#  pip3 install beautifulsoup4
#  pip3 install lxml ??? (Double check if required)
#  pip3 install html5lib ??? (Double check if required)
#  pip3 install pywhatkit
#  pip3 install matplotlib
#  pip3 install selenium
#  pip3 install tabulate
#  pip3 install thefuzz


# In[ ]:


from datetime import date

# Change for each day
ipl_day_0 = date(2025, 3, 21)
ipl_day_cur = date.today()
day_num = abs((ipl_day_cur - ipl_day_0).days)
day_num = 9
day = 'day_' + str(day_num)
prev_day = 'day_' + str(day_num - 1)
print(day_num)


# In[ ]:


from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

user_agent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.50 Safari/537.36'
chrome_options = Options()
chrome_options.add_argument('user-agent={0}'.format(user_agent))
chrome_options.add_argument("--window-size=1920,1080")
chrome_options.add_argument("--headless=new")
chrome_options.add_argument("--no-sandbox")

driver = webdriver.Chrome(options=chrome_options)

url = 'https://www.iplt20.com/stats/2025'
driver.get(url)

button = driver.find_element(By.CLASS_NAME, "awardsStats")

button.click()

button = driver.find_element(By.CLASS_NAME, "ups")

button.click()
button = WebDriverWait(driver, 10).until(
    EC.element_to_be_clickable((By.XPATH, ".//a[contains(@ng-click, 'showAllmvp')]"))
)

driver.execute_script("arguments[0].click();", button)

html = driver.page_source

driver.quit()


# In[16]:


tables = pd.read_html(io.StringIO(html))
mvp_df = [table for table in tables if 'Pts' in table][0]
## Clean up Player coloumn
mvp_df[['Player', 'Team']] = mvp_df['Player'].str.rsplit(' ', n=1, expand=True)
mvp_df['Player'] = mvp_df['Player'].str.replace('\\s+', ' ', regex=True)
mvp_df['Player'] = mvp_df['Player'].str.lower()
mvp_df.to_csv(f'./data/mvp_{day}.csv', index=False)
mvp_df


# In[ ]:


from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

user_agent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.50 Safari/537.36'
chrome_options = Options()
chrome_options.add_argument('user-agent={0}'.format(user_agent))
chrome_options.add_argument("--window-size=1920,1080")
chrome_options.add_argument("--headless=new")
chrome_options.add_argument("--no-sandbox")
driver = webdriver.Chrome(options=chrome_options)

url = 'https://www.espncricinfo.com/series/ipl-2025-1449924/points-table-standings'
driver.get(url)
html = driver.page_source
driver.quit()

tables = pd.read_html(io.StringIO(html))

ipl_team_pts_tbl = [table for table in tables if 'PT' in table][0]
ipl_team_pts_tbl = ipl_team_pts_tbl.iloc[::2]
ipl_team_pts_tbl = ipl_team_pts_tbl.iloc[:, :12]
ipl_team_pts_tbl['Teams'] = ipl_team_pts_tbl['Teams'].replace('\\s+', ' ', regex=True).replace('\\d', '', regex=True)
ipl_team_pts_tbl.to_csv(f'./data/standings_{day}.csv',index=False)

