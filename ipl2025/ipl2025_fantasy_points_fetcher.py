#!/usr/bin/env python
# coding: utf-8

# In[36]:


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


# In[37]:


# Backup the input and output files for each day for posterity

# Change for each day
day_num = 4
day = 'day_' + str(day_num)
prev_day = 'day_' + str(day_num - 1)


# In[38]:


from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

driver = webdriver.Chrome()

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


# In[39]:


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

driver = webdriver.Chrome()

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

