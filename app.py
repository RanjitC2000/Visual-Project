import csv
import pandas as pd
import numpy as np
import math
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import json
from flask import Flask,jsonify,render_template,request
from flask_cors import CORS
from sklearn.cluster import KMeans
from sklearn.preprocessing import MinMaxScaler
from sklearn import manifold
from collections import defaultdict
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)

selected_country_map = ""
selected_industry_hist = ""

df = pd.read_csv('static/data/_CO822C_Emissions_Intensities%2C_and_Emissions_Multipliers.csv')
df = df[df['CTS_Name'] == 'CO2 Emissions']
df_land = pd.read_csv('static/data/Land_Cover_Accounts.csv')
df_land = df_land[df_land['ISO2'].notnull()]
df_land = df_land[df_land['Climate_Influence'] == 'Climate regulating']

df_energy = pd.read_csv('static/data/Energy_Transition.csv')

df['Value'] = df.iloc[:, 12:].sum(axis=1)
df_select_country = df.groupby(['Country', 'ISO2', 'ISO3', 'Industry']).sum()
df_select_country.reset_index(inplace=True)
#write to csv
df_select_country.to_csv('static/data/df_select_country.csv')
df = df.groupby(['Country', 'ISO2','ISO3']).sum()
df.reset_index(inplace=True)
df = df.sort_values(by='Value', ascending=False)
df['Country'] = df['Country'].replace('China, P.R.: Mainland', 'China')
df['Country'] = df['Country'].replace('Taiwan Province of China', 'Taiwan')
df['Country'] = df['Country'].replace('Poland, Rep. of', 'Poland')
df['Country'] = df['Country'].replace('Russian Federation', 'Russia')
df['Country'] = df['Country'].replace('United States', 'USA')
df['Country'] = df['Country'].replace('Kazakhstan, Rep. of', 'Kazakhstan')
df['Country'] = df['Country'].replace('Netherlands, The', 'Netherlands')
df['Country'] = df['Country'].replace('Estonia, Rep. of', 'Estonia')
df['Country'] = df['Country'].replace('Croatia, Rep. of', 'Croatia')
df['Country'] = df['Country'].replace('Slovenia, Rep. of', 'Slovenia')
df['Country'] = df['Country'].replace("Lao People's Dem. Rep.", 'Laos')
df['Country'] = df['Country'].replace('Korea, Rep. of','South Korea')
df['Country'] = df['Country'].replace('China, P.R.: Hong Kong', 'Hong Kong')

df_land['Value'] = df_land.iloc[:, 11:].sum(axis=1)
pivot_land = df_land.pivot(index='Country', columns='CTS_Name', values='Value')
pivot_land.reset_index(inplace=True)
pivot_land.columns.name = None
pivot_land = pivot_land.fillna(0)
land_cols = pivot_land.columns.to_list()
land_cols = land_cols[1:]

scalar = StandardScaler()
mixmaxscalar = MinMaxScaler()
scaled_df = scalar.fit_transform(pivot_land[land_cols])
scaled_df = pd.DataFrame(scaled_df, columns=land_cols)
scaled_df = pd.DataFrame(mixmaxscalar.fit_transform(scaled_df), columns=land_cols)

kmeans = KMeans(n_clusters= 3)
kmeans_res = kmeans.fit_predict(scaled_df)

@app.route('/')
def index():
    global selected_country_map
    global selected_industry_hist
    selected_country_map = ""
    selected_industry_hist = ""
    return render_template('index.html')

@app.route('/bar', methods=['GET', 'POST'])
def bar():
    global selected_industry_hist
    if request.method == 'POST':
        selected_industry_hist = request.get_json()
        selected_industry_hist = selected_industry_hist['industry']
    if selected_country_map != "":
        df_bar = df_select_country[df_select_country['ISO3'] == selected_country_map]
        df_bar = df_bar[['Industry', 'Value', 'ISO3']]
        df_bar = df_bar.sort_values(by='Value', ascending=False)
        #df_bar.loc[len(df_bar)] = ['Others', df_bar.iloc[10:]['Value'].sum()]
        df_bar = df_bar.iloc[:10]
        df_bar = df_bar.sort_values(by='Value', ascending=False)
        df_bar['Value'] = df_bar['Value'].round(2)
        df_bar.columns = ['value1', 'value2', 'value3']
    else:
        df_bar = df.copy()
        df_bar = df[['Country', 'Value']]
        df_bar.loc[len(df_bar)] = ['Others', df_bar.iloc[30:]['Value'].sum()]
        df_bar2 = df_bar.iloc[-1]
        df_bar = df_bar.iloc[:30]
        df_bar = df_bar.append(df_bar2)
        df_bar.columns = ['value1', 'value2']
    return jsonify(df_bar.to_dict(orient='records'))

df_tree = df.copy()

df_continent = pd.read_csv('static/data/Continents.csv')
df_continent = df_continent[['Country', 'Continent']]
df_tree = pd.merge(df_tree, df_continent, on='Country', how='left')
df_tree = df_tree[['ISO2', 'Value', 'Continent']]
df_tree['Value'] = df_tree['Value'].round(2)
children = []
for continent in df_tree['Continent'].unique():
    df_tree_continent = df_tree[df_tree['Continent'] == continent]
    children_country = []
    for country in df_tree_continent['ISO2']:
        value = df_tree_continent[df_tree_continent['ISO2'] == country]['Value'].values[0]
        percent = round(value * 100/ df_tree['Value'].sum(),2)
        children_country.append({'name': country, 'value': value, 'percent': percent})
    children.append({'name': continent, 'children': children_country})
treemap = {"children": children}

df_map = df.copy()
df_pop = pd.read_csv('static/data/pop.csv')
df_map = pd.merge(df_map, df_pop, on="ISO3", how='left')
df_map['code'] = df_map['ISO3']
df_map['pop'] = df_map['Value'].round(2)
df_map = df_map[['name', 'code', 'pop']]

@app.route('/map',methods=['GET','POST'])
def map():
    global selected_country_map
    if request.method == 'POST':
        selected_country_map = request.get_json()
        selected_country_map = selected_country_map['key']
    return jsonify(df_map.to_dict(orient='records'))

@app.route('/tree')
def tree():
    return jsonify(treemap)

@app.route('/pcp')
def pcp():
    df_pcp = pivot_land[land_cols]
    df_pcp['color'] = kmeans_res.tolist()
    df_pcp = df_pcp.T
    obj_ = {
        'data':list(df_pcp.to_dict().values()),
        'name':pivot_land['Country'].tolist()
    }
    return jsonify(json.dumps(obj_))
@app.route('/hist')
def hist():
    if selected_industry_hist != "":
        df_hist = df_select_country[df_select_country['ISO3'] == selected_country_map]
        df_hist = df_hist[df_hist['Industry'] == selected_industry_hist]
        df_hist = df_hist.iloc[:, 5:-1]
    else:
        if selected_country_map != "":
            df_hist = df[df['ISO3'] == selected_country_map]
        else:
            df_hist = df.copy()
        df_hist = df_hist.iloc[:, 4:-1]
    return jsonify(df_hist.to_dict(orient='records'))

if __name__ == '__main__':
    app.run(debug=True)
