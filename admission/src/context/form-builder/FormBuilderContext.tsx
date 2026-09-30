"use client";

import {
 createContext,
 useContext,
 useState,
 ReactNode
} from "react";

import { CanvasNode } from "@/types/form-builder/field";


interface BuilderContextType {

 nodes: CanvasNode[];

 addNode:(node:CanvasNode)=>void;

 updateNode:(node:CanvasNode)=>void;

 deleteNode:(id:string)=>void;

}



const FormBuilderContext =
createContext<BuilderContextType | null>(null);



export function FormBuilderProvider({
 children
}:{
 children:ReactNode
}){


const [nodes,setNodes]=useState<CanvasNode[]>([]);



function addNode(node:CanvasNode){

setNodes(prev=>[
 ...prev,
 node
]);

}



function updateNode(node:CanvasNode){

setNodes(prev=>
 prev.map(item=>
 item.id===node.id
 ?
 node
 :
 item
 )
);

}



function deleteNode(id:string){

setNodes(prev=>
 prev.filter(item=>item.id!==id)
);

}



return (

<FormBuilderContext.Provider

value={{
 nodes,
 addNode,
 updateNode,
 deleteNode
}}

>

{children}

</FormBuilderContext.Provider>

)

}



export function useFormBuilder(){

const context=
useContext(FormBuilderContext);


if(!context){

throw new Error(
"useFormBuilder must be used inside FormBuilderProvider"
);

}


return context;

}
