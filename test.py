import csv
import pandas as pd
import numpy as np
import math
df = pd.read_csv('static/data/_CO822C_Emissions_Intensities%2C_and_Emissions_Multipliers.csv')
#select only first 4 columns and all after 6th column except last column
df = df.iloc[:, np.r_[0:4, 5:len(df.columns)-1]]
print(df)
# df = df.sum(axis=0)
# #set columns as Year and Value
# df = df.reset_index()
# df.columns = ['Year', 'Value']
# print(df)