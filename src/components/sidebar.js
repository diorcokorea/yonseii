import React,{useState} from 'react';
import {Card} from 'antd';

const {Meta}=Card;

const Sidebar=(props)=>{
    const [sel,setSel]=useState();
    const selectHandle=()=>{
        console.log('sss')
    }
    console.log(props)
    return(
        <div className="sidebar">
        <Card
    hoverable
    cover={<img alt="example" src={props.imgurl} width={240}/>}
  >
    <Meta title="Europe Street beat" description="www.instagram.com" />
  </Card>     

        </div>
    )
}

export default Sidebar;