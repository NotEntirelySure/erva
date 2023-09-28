import React, { useState, useEffect } from 'react';
import { Col, Divider, Row, Typography} from 'antd';
import GlobalHeader from '../../components/GlobalHeader';
import { Layout, Menu } from 'antd';
const { Header, Content, Footer, Sider } = Layout;


export default function TestPage() {
  
  return (<>
  
    <GlobalHeader/>
    <Layout hasSider>
      <Sider
        style={{
          overflow: 'auto',
          position: 'fixed',
          left: 0,
          top:0,
          marginTop:'7rem',
          bottom: 0,
          backgroundColor:'white'
        }}
      >
        <div />
        <Menu theme="light" mode="inline" defaultSelectedKeys={['4']} items={[{key:'1',label:"test1"}, {key:'2',label:"test2"},{key:'3',label:"test3"}]} />
      </Sider>
      <Layout
        className="site-layout"
        style={{
          marginLeft: 200,
        }}
      >
        <Content
          style={{
            margin: '24px 16px 0',
            overflow: 'initial',
          }}
        >
          <div
            style={{
              padding: 24,
              textAlign: 'center',
              background: 'white',
            }}
          >
            <p>long content</p>
            {
              // indicates very long content
              Array.from(
                {
                  length: 100,
                },
                (_, index) => (
                  <React.Fragment key={index}>
                    {index % 20 === 0 && index ? 'more' : '...'}
                    <br />
                  </React.Fragment>
                ),
              )
            }
          </div>
        </Content>
        <Footer
          style={{
            textAlign: 'center',
          }}
        >
          Ant Design ©2023 Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
    </>
  );
};