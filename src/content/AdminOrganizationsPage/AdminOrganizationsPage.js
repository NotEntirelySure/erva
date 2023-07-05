import React, { useState, useEffect, useRef } from 'react';
import AdminHeader from '../../components/AdminHeader';
import {
  Button,
  Content,
  DataTable,
  Dropdown,
  Form,
  Modal,
  Stack,
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  TableToolbarMenu,
  TableToolbarAction,
  TextInput,
  DataTableSkeleton
} from '@carbon/react';
import { Add, Edit, TrashCan } from '@carbon/react/icons';

export default function AdminOrganizationsPage() {

  const states = [
    {text:'Alabama', value:'AL'}, {text:'Alaska', value:'AK'}, {text:'Arizona', value:'AZ'},
    {text:'Arkansas', value:'AR'}, {text:'California', value:'CA'}, {text:'Colorado', value:'CO'},
    {text:'Connecticut', value:'CT'}, {text:'Delaware', value:'DE'}, {text:'Florida', value:'FL'},
    {text:'Georgia', value:'GA'}, {text:'Hawaii', value:'HI'}, {text:'Idaho', value:'ID'},
    {text:'Illinois', value:'IL'}, {text:'Indiana', value:'IN'}, {text:'Iowa', value:'IA'},
    {text:'Kansas', value:'KS'}, {text:'Kentucky', value:'KY'}, {text:'Louisiana', value:'LA'},
    {text:'Maine', value:'ME'}, {text:'Maryland', value:'MD'}, {text:'Massachusetts', value:'MA'},
    {text:'Michigan', value:'MI'}, {text:'Minnesota', value:'MN'}, {text:'Mississippi', value:'MS'},
    {text:'Missouri', value:'MO'}, {text:'Montana', value:'MT'}, {text:'Nebraska', value:'NE'},
    {text:'Nevada', value:'NV'}, {text:'New Hampshire', value:'NH'}, {text:'New Jersey', value:'NJ'},
    {text:'New Mexico', value:'NM'}, {text:'New York', value:'NY'}, {text:'North Carolina', value:'NC'},
    {text:'North Dakota', value:'ND'}, {text:'Ohio', value:'OH'}, {text:'Oklahoma', value:'OK'},
    {text:'Oregon', value:'OR'}, {text:'Pennsylvania', value:'PA'}, {text:'Puerto Rico', value:'PR'}, 
    {text:'Rhode Island', value:'RI'}, {text:'South Carolina', value:'SC'}, {text:'South Dakota', value:'SD'},
    {text:'Tennessee', value:'TN'}, {text:'Texas', value:'TX'}, {text:'Utah', value: 'UT' }, 
    {text:'Vermont', value:'VT'}, {text:'Virginia', value:'VA'}, {text:'Washington', value:'WA'},
    {text:'Washington DC', value:'DC'}, {text:'West Virginia', value:'WV'}, {text:'Wisconsin', value:'WI'},
    {text:'Wyoming', value:'WY'}
  ];
  
  const orgTableHeader = [
    {key:'officeId', header:'Office ID'},
    {key:'name', header:'Name'},
    {key:'address', header:'Address'},
    {key:'city', header:'City'},
    {key:'state', header:'State'},
    {key:'zip', header:'Zip Code'},
    {key:'action', header:'Action'}
  ]

  const emptyOfficeData = {
    action:"",
    id:"",
    name:"",
    address:"",
    city:"",
    state:"",
    zip:"",
    image:'',
    lat:0,
    long:0
  }

  const officeToDelete = useRef({id:'',name:''})

  const [officeData, setOfficeData] = useState([emptyOfficeData]);
  const [addEditModalOpen, setAddEditModalOpen] = useState(false);
  const [addEditData, setAddEditData] = useState(emptyOfficeData);
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);
  const [showDataTable, setShowDataTable] = useState('none');
  const [showTableSkeleton, setShowTableSekeleton] = useState('block');

  useEffect(() => {GetOffices();},[]);

  async function GetOffices() {
    if (showDataTable === 'block') setShowDataTable('none');
    if (showTableSkeleton === 'none') setShowTableSekeleton('block'); 
    const officesRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/offices/getall`,{mode:'cors'});
    const officesResponse = await officesRequest.json();
    const offices = officesResponse.map((office, index) => (
      {
        id:String(index),
        officeId:office.offices_id,
        name:office.offices_name,
        address:office.offices_address,
        city:office.offices_city,
        state:office.offices_state,
        zip:office.offices_zip,
        image:office.offices_image,
        lat:office.offices_lat,
        long:office.offices_long,
        action:<>
          <div>
          <Button
            hasIconOnly
            renderIcon={Edit}
            iconDescription={`Edit ${office.offices_name}`}
            onClick={() => {
              setAddEditData({
                  action:"edit",
                  id:office.offices_id,
                  name:office.offices_name,
                  address:office.offices_address,
                  city:office.offices_city,
                  state:states.find(element => element.value === office.offices_state),
                  zip:office.offices_zip,
                  image:office.offices_image,
                  lat:office.offices_lat,
                  long:office.offices_long
                })
                setAddEditModalOpen(true);
              }}
          />
          <Button
            hasIconOnly
            kind='danger'
            renderIcon={TrashCan}
            iconDescription={`Delete Organization`}
            onClick={() => {
              officeToDelete.current = {id:office.offices_id, name:office.offices_name};
              setConfirmDeleteModalOpen(true);
            }}
          />
          </div>
        </>
     }
    ))
    setOfficeData(offices);
    setShowTableSekeleton('none');
    setShowDataTable('block');
  }

  async function AddEditOffice() {
    setAddEditModalOpen(false);
    const addRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/offices/${addEditData.action}`, {
      method:'POST',
      mode:'cors',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(addEditData)
    })
    const addResponse = await addRequest.json();
    if (addResponse.code === 200) GetOffices();
  }

  async function DeleteOffice() {
    setConfirmDeleteModalOpen(false);
    const deleteRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/offices/delete`, {
      method:'DELETE',
      mode:'cors',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(officeToDelete.current)
    })
    const deleteResponse = await deleteRequest.json();
    if (deleteResponse.code === 200) GetOffices();
  } 

  return (
    <>
      <Modal
        id="ConfirmDeleteModal"
        danger
        size='sm'
        open={confirmDeleteModalOpen}
        modalHeading='Confirm Delete'
        modalAriaLabel="confirm delete modal"
        onRequestClose={() => {
          setConfirmDeleteModalOpen(false);
          officeToDelete.current = {id:'',name:''};
        }}
        onRequestSubmit={() => DeleteOffice()}
        primaryButtonText='Delete'
        secondaryButtonText='Cancel'
        children={`Are you sure you want to delete ${officeToDelete.current.name}?`}
      />
      <Modal
        id="addEditModal"
        open={addEditModalOpen}
        modalHeading={addEditData.action === "add" ? "Add Office":`Edit ${addEditData.name}`}
        modalAriaLabel="Add/Edit modal"
        onRequestClose={() => {
          setAddEditModalOpen(false);
          setAddEditData(emptyOfficeData);
        }}
        onRequestSubmit={() => AddEditOffice()}
        primaryButtonText={`${addEditData.action.charAt(0).toUpperCase()}${addEditData.action.slice(1)}`}
        secondaryButtonText="Cancel"
        children={
          <Form>
            <Stack gap={5}>
              <TextInput
                id="name"
                labelText="Name"
                value={addEditData.name}
                onChange={event => setAddEditData(previousState => ({...previousState, name:event.target.value}))}
              />
              <TextInput
                id="address"
                labelText="Address"
                value={addEditData.address}
                onChange={event => setAddEditData(previousState => ({...previousState, address:event.target.value}))}
              />
              <div style={{display:'grid', gap:'2rem', alignItems:'baseline', gridTemplateColumns:'2fr 1.5fr 1fr'}}>
                <div>
                  <TextInput
                    id="city"
                    labelText="City"
                    value={addEditData.city}
                    onChange={event => setAddEditData(previousState => ({...previousState, city:event.target.value}))}
                  />
                </div>
                <div> 
                  <Dropdown
                    id="state"
                    titleText="State"
                    label="Select"
                    items={states}
                    selectedItem={addEditData.state}
                    itemToString={item => (item ? item.text : '')}
                    onChange={event => {setAddEditData(previousState => ({...previousState, state:event.selectedItem}))}}
                  />
                </div>
                <div>
                  <TextInput
                    id="zip"
                    labelText="Zip"
                    value={addEditData.zip}
                    onChange={event => setAddEditData(previousState => ({...previousState, zip:event.target.value}))}
                  />
                </div>
              </div>
            </Stack>
          </Form>
        }
      />
      <AdminHeader activeSideBarItem="organizations"/>
      <Content className='pageContent'>
        <div style={{display:showDataTable}}> 
          <DataTable rows={officeData} headers={orgTableHeader} isSortable>
            {({
              rows,
              headers,
              getHeaderProps,
              getRowProps,
              getTableProps,
              getToolbarProps,
              onInputChange,
            }) => (
              <TableContainer 
                title='Organizations'
                description='Displays a list of all organizations registered in the database.'
              >
                <TableToolbar {...getToolbarProps()} aria-label="data table toolbar">
                  <TableToolbarContent>
                    <TableToolbarSearch onChange={onInputChange} />
                    <TableToolbarMenu light>
                      <TableToolbarAction onClick={()=>{}}>
                        Action 1
                      </TableToolbarAction>
                      <TableToolbarAction onClick={()=>{}}>
                        Action 2
                      </TableToolbarAction>
                      <TableToolbarAction onClick={()=>{}}>
                        Action 3
                      </TableToolbarAction>
                    </TableToolbarMenu>
                    <Button
                      hasIconOnly
                      aria-label='add office'
                      iconDescription='Add Office'
                      renderIcon={Add}
                      onClick={() => {
                        setAddEditData({
                          action:"add",
                          name:"",
                          address:"",
                          city:"",
                          state:"",
                          zip:"",
                          image:'',
                          lat:0,
                          long:0
                        });
                        setAddEditModalOpen(true);
                      }}
                    />
                  </TableToolbarContent>
                </TableToolbar>
                <Table {...getTableProps()}>
                  <TableHead>
                    <TableRow>
                      {headers.map((header) => (
                        <TableHeader key={header.key} {...getHeaderProps({ header })}>
                          {header.header}
                        </TableHeader>
                      ))}
                      <TableHeader />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.id} {...getRowProps({ row })}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>{cell.value}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DataTable>
        </div>
          <div style={{display:showTableSkeleton}}>
            <DataTableSkeleton
              showHeader
              showToolbar
              headers={orgTableHeader}

            />
          </div>
      </Content>
    </>
  )

}