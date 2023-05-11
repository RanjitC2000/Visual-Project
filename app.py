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
selected_country_tree = "-1"
selected_year_range = ""
selected_continent = ""
year_key = {1995:0,1999:1,2003:2,2007:3,2011:4,2015:5}
treemap = {}

df = pd.read_csv('static/data/_CO822C_Emissions_Intensities%2C_and_Emissions_Multipliers.csv')
#rename columns from the 12th column to the last column
df.columns = df.columns[:12].tolist() + [str(i) for i in range(1995, 2019)]
df = df[df['CTS_Name'] == 'CO2 Emissions']
df_land = pd.read_csv('static/data/Land_Cover_Accounts.csv')
df_land = df_land[df_land['ISO2'].notnull()]
df_land = df_land[df_land['Climate_Influence'] == 'Climate regulating']

df_continent = pd.read_csv('static/data/Continents1.csv')
df_continent = df_continent[['ISO3','Continent']]

df_energy = pd.read_csv('static/data/Energy_Transition.csv')
df_energy = df_energy[df_energy['Indicator'] == 'Electricity Generation']
df_energy = df_energy[df_energy['Energy_Type'] == 'Total Renewable']
df_energy = df_energy[df_energy['ISO2'].notnull()]
df_energy['Value'] = df_energy.iloc[:,12:].sum(axis=1)
df_energy_Tech = df_energy.copy()
df_energy = df_energy.groupby(['Country', 'ISO2', 'ISO3']).sum()
df_energy.reset_index(inplace=True)
df_energy = pd.merge(df_energy,df_continent, on='ISO3', how='left')

df_energy_Tech = df_energy_Tech.groupby(['Country', 'ISO2', 'ISO3', 'Technology']).sum()
df_energy_Tech.reset_index(inplace=True)
df_energy_Tech = pd.merge(df_energy_Tech,df_continent, on='ISO3', how='left')



df['Value'] = df.iloc[:, 12:].sum(axis=1)
df_select_country = df.groupby(['Country', 'ISO2', 'ISO3', 'Industry']).sum()
df_select_country.reset_index(inplace=True)
df_select_country = pd.merge(df_select_country, df_continent, on='ISO3', how='left')
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
df = pd.merge(df, df_continent, on='ISO3', how='left')

df_land['Value'] = df_land.iloc[:, 11:].sum(axis=1)
pivot_land = df_land.pivot(index='ISO3', columns='CTS_Name', values='Value')
pivot_land.reset_index(inplace=True)
pivot_land.columns.name = None
pivot_land = pivot_land.fillna(0)
pivot_land = pd.merge(pivot_land, df_continent, on='ISO3', how='left')
land_cols = pivot_land.columns.to_list()
land_cols = land_cols[1:-1]

@app.route('/')
def index():
    global selected_country_map
    global selected_industry_hist
    global selected_country_tree
    global selected_year_range
    global selected_continent
    selected_country_map = ""
    selected_industry_hist = ""
    selected_country_tree = "-1"
    selected_year_range = ""
    selected_continent = ""
    return render_template('index.html')

@app.route('/bar', methods=['GET', 'POST'])
def bar():
    global selected_industry_hist
    if request.method == 'POST':
        selected_industry_hist = request.get_json()
        selected_industry_hist = selected_industry_hist['industry']
    df_bar = df_select_country.copy()
    if selected_continent != "":
        df_bar = df_bar[df_bar['Continent'] == selected_continent]
        if selected_year_range != "":
            df_bar = df_bar.iloc[:, np.r_[0:4, 5+(year_key[selected_year_range]*4):9+(year_key[selected_year_range]*4),-1]]
            obj_ = {
                'Country': df_bar['Continent'].iloc[0],
                'Year': str(selected_year_range) + '-' + str(selected_year_range+4)
            }
            if selected_industry_hist != "":
                df_bar = df_bar[df_bar['Industry'] == selected_industry_hist]
                obj_['Industry'] = selected_industry_hist
            df_bar = df_bar.iloc[:, 4:-1]
            df_bar = df_bar.sum(axis=0)
            df_bar = df_bar.reset_index()
            df_bar.columns = ['value1', 'value2']
            obj_['data'] = list(df_bar.T.to_dict().values())
            return jsonify(json.dumps(obj_))
        obj_ = {
            'Country': df_bar['Continent'].iloc[0]
        }
        df_bar = df_bar.groupby(['Industry']).sum()
        df_bar = df_bar.reset_index()
        df_bar = df_bar[['Industry', 'Value']]
        df_bar = df_bar.sort_values(by='Value', ascending=False)
        df_bar = df_bar.iloc[:10]
        df_bar['Value'] = df_bar['Value'].round(2)
        df_bar.columns = ['value1', 'value2']
        obj_['data'] = list(df_bar.T.to_dict().values())
        return jsonify(json.dumps(obj_))
    if selected_country_map != "":
        df_bar = df_bar[df_bar['ISO3'] == selected_country_map]
        if selected_year_range != "":
            df_bar = df_bar.iloc[:, np.r_[0:4, 5+(year_key[selected_year_range]*4):9+(year_key[selected_year_range]*4)]]
            obj_ = {
                'Country': df_bar['Country'].iloc[0],
                'Year': str(selected_year_range) + '-' + str(selected_year_range+4)
            }
            if selected_industry_hist != "":
                df_bar = df_bar[df_bar['Industry'] == selected_industry_hist]
                obj_['Industry'] = selected_industry_hist
            df_bar = df_bar.iloc[:, 4:]
            df_bar = df_bar.sum(axis=0)
            df_bar = df_bar.reset_index()
            df_bar.columns = ['value1', 'value2']
            obj_['data'] = list(df_bar.T.to_dict().values())
            return jsonify(json.dumps(obj_))
        obj_ = {
            'Country': df_bar['Country'].iloc[0]
        }
        df_bar = df_bar[['Industry', 'Value', 'ISO3']]
        df_bar = df_bar.sort_values(by='Value', ascending=False)
        df_bar = df_bar.iloc[:10]
        df_bar['Value'] = df_bar['Value'].round(2)
        df_bar.columns = ['value1', 'value2', 'value3']
        obj_['data'] = list(df_bar.T.to_dict().values())
        return jsonify(json.dumps(obj_))
    elif selected_year_range != "":
        df_bar = df.iloc[:, np.r_[0:4, 4+(year_key[selected_year_range]*4):8+(year_key[selected_year_range]*4)]]
        df_bar = df_bar.iloc[:, 4:]
        df_bar = df_bar.sum(axis=0)
        df_bar = df_bar.reset_index()
        df_bar.columns = ['value1', 'value2']
        obj_ = {
            'data': list(df_bar.T.to_dict().values()),
            'Year': str(selected_year_range) + '-' + str(selected_year_range+4)
        }
        return jsonify(json.dumps(obj_))
    else:
        df_bar = df.copy()
        if selected_continent != "":
            df_bar = df_bar[df_bar['Continent'] == selected_continent]
        df_bar = df_bar[['Country','Continent', 'Value']]
        if selected_continent == "":
            df_bar = df_bar.append({'Country': 'Others','Continent':'Oceania', 'Value': df_bar.iloc[30:]['Value'].sum()}, ignore_index=True)
            df_bar2 = df_bar.iloc[-1]
            df_bar = df_bar.iloc[:30]
            df_bar = df_bar.append(df_bar2)
        df_bar = df_bar[['Country', 'Continent', 'Value']]
        df_bar = df_bar.append(df_bar.iloc[0])
        df_bar = df_bar.iloc[1:]
        df_bar.columns = ['value1', 'value2', 'value3']
        obj_ = {
            'data': list(df_bar.T.to_dict().values()),
            'total': round(df_bar['value3'].sum(),2)
        }
    return jsonify(json.dumps(obj_))

df_map = df.copy()
df_pop = pd.read_csv('static/data/pop.csv')
df_map = pd.merge(df_map, df_pop, on="ISO3", how='left')
df_map['code'] = df_map['ISO3']
df_map['pop'] = df_map['Value'].round(2)
df_map = df_map[['name', 'code', 'pop']]

@app.route('/map',methods=['GET','POST'])
def map():
    global selected_country_map
    global selected_industry_hist
    global selected_year_range
    if request.method == 'POST':
        selected_country_map = request.get_json()
        selected_country_map = selected_country_map['key']
        selected_industry_hist = "" 
        selected_year_range = ""
    return jsonify(df_map.to_dict(orient='records'))

@app.route('/tree',methods=['GET','POST'])
def tree():
    global selected_country_tree
    global treemap
    if request.method == 'POST':
        selected_country_tree = request.get_json()
        selected_country_tree = selected_country_tree['key']
    df_tree = df_energy_Tech.copy()
    if selected_continent != "":
        df_tree = df_tree[df_tree['Continent'] == selected_continent]
    if selected_country_tree != "-1":
        df_tree = df_tree[df_tree['ISO2'] == selected_country_tree]
        selected_country_tree_name = df_tree['Country'].iloc[0]
        selected_continent_tree_name = df_tree['Continent'].iloc[0]
        df_tree = df_tree[['Technology', 'Value']]
        df_tree['Value'] = df_tree['Value'].round(2)
        df_tree.columns = ['name', 'value']
        children = []
        for tech in df_tree['name'].unique():
            value = df_tree[df_tree['name'] == tech]['value'].values[0]
            percent = round(value * 100/ df_tree['value'].sum(),2)
            children.append({'name': tech, 'value': value, 'percent': percent})
        treemap = {"children": children, "Cont":selected_continent_tree_name, "Cname": selected_country_tree_name, "total": round(df_tree['value'].sum(),2)}
    else:
        df_tree = df_energy.copy()
        df_tree = df_tree[['Country','ISO2', 'Value', 'Continent']]
        if selected_continent != "":
            df_tree = df_tree[df_tree['Continent'] == selected_continent]
        df_tree['Value'] = df_tree['Value'].round(2)
        df_tree = df_tree.sort_values(by='Value', ascending=False)
        children = []
        for continent in df_tree['Continent'].unique():
            df_tree_continent = df_tree[df_tree['Continent'] == continent]
            children_country = []
            for country in df_tree_continent['ISO2']:
                value = df_tree_continent[df_tree_continent['ISO2'] == country]['Value'].values[0]
                percent = round(value * 100/ df_tree['Value'].sum(),2)
                children_country.append({'name': country, 'value': value, 'percent': percent,'CName': df_tree_continent[df_tree_continent['ISO2'] == country]['Country'].values[0]})
            children.append({'name': continent, 'children': children_country})
        treemap = {"children": children, "total": round(df_tree['Value'].sum(),2)}
    return jsonify(treemap)

continents = {'Asia':0,'Europe':1,'Africa':2,'North America':3,'South America':4,'Oceania':5}

@app.route('/pcp',methods=['GET','POST'])
def pcp():
    global selected_country_map
    global selected_industry_hist
    global selected_continent
    global selected_country_tree
    if request.method == 'POST':
        selected_continent = request.get_json()
        selected_continent = selected_continent['key']
        selected_country_tree = "-1"
        selected_country_map = ""
        selected_industry_hist = ""
    df_pcp = pivot_land[land_cols]
    df_pcp['color'] = pivot_land['Continent'].map(continents)
    df_pcp = df_pcp.T
    obj_ = {
        'data':list(df_pcp.to_dict().values()),
        'name':pivot_land['ISO3'].tolist()
    }
    return jsonify(json.dumps(obj_))
@app.route('/hist',methods=['GET','POST'])
def hist():
    global selected_year_range
    if request.method == 'POST':
        selected_year_range = request.get_json()
        selected_year_range = selected_year_range['year_range']
    df_hist = df_select_country.copy()
    df_hist1 = df.copy()
    obj_ = {}
    if selected_continent != "":
        df_hist = df_hist[df_hist['Continent'] == selected_continent]
        df_hist1 = df_hist1[df_hist1['Continent'] == selected_continent]
        obj_ = {
            'name': [df_hist['Continent'].iloc[0]],
            'continent': df_hist['Continent'].iloc[0]
        }
    if selected_industry_hist != "":
        if selected_country_map != "":
            df_hist = df_hist[df_hist['ISO3'] == selected_country_map]
        df_hist = df_hist[df_hist['Industry'] == selected_industry_hist]
        # df_hist = df_hist.iloc[:, 5:-1]
        if not obj_:
            obj_ = {
                'data':list(df_hist.iloc[:,5:-1].T.to_dict().values()),
                'name':df_hist['Country'].tolist(),
                'continent':df_hist['Continent'].iloc[0],
                'Industry':df_hist['Industry'].tolist()
            }
        else:
            obj_['data'] = list(df_hist.iloc[:,5:-1].T.to_dict().values())
            obj_['Industry'] = df_hist['Industry'].iloc[0]
    else:
        if selected_country_map != "":
            df_hist = df_hist1[df_hist1['ISO3'] == selected_country_map]
        else:
            df_hist = df_hist1.copy()
        # df_hist = df_hist.iloc[:, 4:-1]
        if not obj_:
            obj_ = {
                'data':list(df_hist.iloc[:,4:-1].T.to_dict().values()),
                'name':df_hist['Country'].tolist(),
                'continent':df_hist['Continent'].iloc[0]
            }
        else:
            obj_['data'] = list(df_hist.iloc[:,4:-1].T.to_dict().values())
    return jsonify(json.dumps(obj_))

@app.route('/get_variable_value')
def get_variable_value():
    return jsonify({'my_variable': selected_year_range})

@app.route('/get_continent_value')
def get_continent_value():
    return jsonify({'my_variable': selected_continent})

if __name__ == '__main__':
    #app.run(debug=True, host='0.0.0.0', port=10000)
    app.run(debug=True)
