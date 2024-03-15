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
    {key:'orgId', header:'Organization ID'},
    {key:'name', header:'Name'},
    {key:'address', header:'Address'},
    {key:'city', header:'City'},
    {key:'state', header:'State'},
    {key:'zip', header:'Zip Code'},
    {key:'action', header:'Action'}
  ]

  const emptyOrgData = {
    action:"",
    id:"",
    name:"",
    address:"",
    city:"",
    state:"",
    zip:""
  }

  const [organizationData, setOrganizationData] = useState([emptyOrgData]);
  const [addEditModalOpen, setAddEditModalOpen] = useState(false);
  const [modOrgData, setModOrgData] = useState(emptyOrgData);
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);
  const [showDataTable, setShowDataTable] = useState('none');
  const [showTableSkeleton, setShowTableSekeleton] = useState('block');
  const [errorInfo, setErrorInfo] = useState({heading:'',message:''});
  const [errorModalOpen, setErrorModalOpen] = useState(false);

  useEffect(() => {GetOrganizations();},[]);

  async function GetOrganizations() {
    if (showDataTable === 'block') setShowDataTable('none');
    if (showTableSkeleton === 'none') setShowTableSekeleton('block'); 
    const query = `
      query {
        getOrganizations {
          id
          name
          address
          city
          state
          zip
        }
      }
    `;

    const orgsRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api`, {
      mode:'cors',
      method:'POST',
      headers: {
        'Content-Type':'application/json',
        Accept: "application/json",
        Authorization:`Bearer {jwt}`,
      },
      body: JSON.stringify({query})
    });
    const orgsResponse = await orgsRequest.json();

    const organizations = orgsResponse.data.getOrganizations.map((org, index) => (
      {
        id:String(index),
        orgId:org.id,
        name:org.name,
        address:org.address,
        city:org.city,
        state:org.state,
        zip:org.zip,
        action:<>
          <Button
            hasIconOnly
            renderIcon={Edit}
            iconDescription={`Edit ${org.name}`}
            onClick={() => {
              setModOrgData({
                  action:"edit",
                  id:org.id,
                  name:org.name,
                  address:org.address,
                  city:org.city,
                  state:states.find(element => element.value === org.state),
                  zip:org.zip
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
              setModOrgData({
                action:"delete",
                id:org.id,
                name:org.name
              });
              setConfirmDeleteModalOpen(true);
            }}
          />
        </>
     }
    ));
    setOrganizationData(organizations);
    setShowTableSekeleton('none');
    setShowDataTable('block');
  }

  async function ModifyOrg() {
    setAddEditModalOpen(false);
    setConfirmDeleteModalOpen(false);
    const query = `
      mutation ($data: ModifyOrg!) {
        modOrganization(orgData: $data) {
          success
          errorCode
          errorMessage
        }
      }
    `;
    const modRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api`, {
      method:'POST',
      mode:'cors',
      headers:{
        'Content-Type':'application/json',
        Accept:'application/json',
        Authorization:`Bearer {jwt}`
      },
      body:JSON.stringify({
        query,
        variables: { data:{...modOrgData, state:modOrgData.state?.value }}
      })
    });
    const modResponse = await modRequest.json();
    setModOrgData(emptyOrgData);
    if (modResponse.data.modOrganization.success) GetOrganizations()
    if (!modResponse.data.modOrganization.success) {
      setErrorInfo({heading:`Error: ${modResponse.data.modOrganization.errorCode}`,message:modResponse.data.modOrganization.errorMessage});
      setErrorModalOpen(true);
    }

  };

  return (
    <>
    <Modal
        id='ErrorModal'
        size='sm'
        open={errorModalOpen}
        modalLabel={errorInfo.heading}
        modalHeading={errorInfo.message}
        modalAriaLabel='error modal'
        primaryButtonText='Ok'
        onRequestClose={() => {
          setErrorModalOpen(false);
          setTimeout(() => setErrorInfo({heading:'',message:''}),750)
        }}
        onRequestSubmit={() => {
          setErrorModalOpen(false);
          setTimeout(() => setErrorInfo({heading:'',message:''}),750)
        }}
      />
      <Modal
        id="ConfirmDeleteModal"
        danger
        size='sm'
        open={confirmDeleteModalOpen}
        modalHeading='Confirm Delete'
        modalAriaLabel="confirm delete modal"
        onRequestClose={() => {
          setConfirmDeleteModalOpen(false);
          setModOrgData(emptyOrgData);
        }}
        onRequestSubmit={() => ModifyOrg()}
        primaryButtonText='Delete'
        secondaryButtonText='Cancel'
        children={`Are you sure you want to delete ${modOrgData.name}?`}
      />
      <Modal
        id="addEditModal"
        size='sm'
        open={addEditModalOpen}
        hasScrollingContent
        modalHeading={modOrgData.action === "add" ? "Add Office":`Edit ${modOrgData.name}`}
        modalAriaLabel="Add/Edit modal"
        onRequestClose={() => {
          setAddEditModalOpen(false);
          setModOrgData(emptyOrgData);
        }}
        onRequestSubmit={() => ModifyOrg()}
        primaryButtonText={modOrgData.action === 'add' ? 'Add':'Save'}
        secondaryButtonText="Cancel"
        children={
          <Form>
            <Stack gap={5}>
              <TextInput
                id="name"
                labelText="Name"
                value={modOrgData.name}
                onChange={event => setModOrgData(previousState => ({...previousState, name:event.target.value}))}
              />
              <TextInput
                id="address"
                labelText="Address"
                value={modOrgData.address}
                onChange={event => setModOrgData(previousState => ({...previousState, address:event.target.value}))}
              />
              <div style={{display:'grid', gap:'2rem', alignItems:'baseline', gridTemplateColumns:'2fr 1.5fr 1fr'}}>
                <div>
                  <TextInput
                    id="city"
                    labelText="City"
                    value={modOrgData.city}
                    onChange={event => setModOrgData(previousState => ({...previousState, city:event.target.value}))}
                  />
                </div>
                <div> 
                  <Dropdown
                    id="state"
                    titleText="State"
                    label="Select"
                    items={states}
                    selectedItem={modOrgData.state}
                    itemToString={item => (item ? item.text : '')}
                    onChange={event => {setModOrgData(previousState => ({...previousState, state:event.selectedItem}))}}
                  />
                </div>
                <div>
                  <TextInput
                    id="zip"
                    labelText="Zip"
                    value={modOrgData.zip}
                    onChange={event => setModOrgData(previousState => ({...previousState, zip:event.target.value}))}
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
          <DataTable rows={organizationData} headers={orgTableHeader} isSortable>
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
                        setModOrgData({
                          action:"add",
                          id:0,
                          name:"",
                          address:"",
                          city:"",
                          state:"",
                          zip:""
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