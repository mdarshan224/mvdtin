from pathlib import Path
import sys, io
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from analytics.processing import summarize,total_by_type
from regression.model import fit_linear
st.set_page_config(page_title='DTM · Data Lab',page_icon='📊',layout='wide')
st.title('DTM · Data Lab')
st.caption('A separate analytics application. Upload aggregate data or inspect the labeled regression example.')
analytics,regression=st.tabs(['Aggregate analytics','Regression example'])
with analytics:
    uploaded=st.file_uploader('Aggregate CSV · date, event_type, count',type=['csv'])
    if uploaded:
        if uploaded.size>5*1024*1024:
            st.error('Use a CSV smaller than 5 MB.')
        else:
            try:
                raw=pd.read_csv(uploaded);data=summarize(raw);totals=total_by_type(raw)
                st.dataframe(data,use_container_width=True)
                fig,ax=plt.subplots(figsize=(9,4))
                totals.plot(kind='bar',ax=ax,color='#f5793b')
                ax.set_xlabel('Event type');ax.set_ylabel('Aggregate count');ax.set_title('Consented aggregate activity')
                fig.tight_layout();st.pyplot(fig);plt.close(fig)
                st.download_button('Download normalized aggregates',data.to_csv(index=False).encode(),'aggregate-events.csv','text/csv')
            except (ValueError,TypeError,KeyError) as e:
                st.error(str(e))
    else:
        st.info('No data loaded. The app does not invent visitor activity.')
with regression:
    st.subheader('Least-squares line · sample data')
    st.write('These six points are an educational dataset, not a project metric.')
    x=np.array([1,2,3,4,5,6]);y=np.array([3,4,6,8,9,12]);fit=fit_linear(x,y)
    value=st.slider('Predict y at x',0.0,10.0,4.0,.1)
    st.metric('Predicted y',f"{fit['slope']*value+fit['intercept']:.2f}")
    st.code(f"y = {fit['slope']:.3f}x + {fit['intercept']:.3f}")
    fig,ax=plt.subplots(figsize=(9,4));ax.scatter(x,y,color='#66cbbd',label='Sample data');line=np.linspace(0,7,50);ax.plot(line,fit['slope']*line+fit['intercept'],color='#f5793b',label='Least-squares line');ax.set_xlabel('x · example input');ax.set_ylabel('y · example response');ax.legend();fig.tight_layout();st.pyplot(fig)
    buffer=io.BytesIO();fig.savefig(buffer,format='png',dpi=180);plt.close(fig)
    st.download_button('Download example chart',buffer.getvalue(),'regression-example.png','image/png')
