import React, {useState, useEffect, useRef} from 'react';
import AdminHeader from '../../components/AdminHeader';
import {
  Button,
  ComboBox,
  Content,
  DataTable,
  DataTableSkeleton,
  Form,
  Modal,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  TextInput,
  Tile,
  Toggle
} from '@carbon/react';
import {
  Add,
  Caution,
  CheckmarkFilled,
  CircleFill,
  CloseOutline,
  Edit,
  Misuse,
  TrashCan
} from '@carbon/react/icons';

export default function AdminUsersPage() {

  const usersHeader = [
    {key:'userId', header:'User ID'},
    {key:'firstName', header:'First Name'},
    {key:'lastName', header:'Last Name'},
    {key:'email', header:'E-mail'},
    {key:'createdAt', header:'Created At'},
    {key:'roleName', header:'Role'},
    {key:'accountTypeName', header:'Account Type'},
    {key:'verifiedStatus', header:'Verified'},
    {key:'enabledStatus', header:'Enabled'},
    {key:'action', header:'Action'}
  ]

  const userToDelete = useRef({userId:'',name:''});

  const [showDataTable, setShowDataTable] = useState('none');
  const [showTableSkeleton, setShowTableSekeleton] = useState('block');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [errorInfo, setErrorInfo] = useState({heading:'',message:''});
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [showRightPane, setShowRightPane] = useState('translateX(35rem)');
  const [editUserData, setEditUserData] = useState({
    userId:0,
    firstName:'',
    lastName:'',
    email:'',
    createdAt:'',
    enabled:false,
    verified:false,
    role:'',
    accountType:''
  });
  const [users, setUsers] = useState([{
    id:'0',
    userId:0,
    firstName:'',
    lastName:'',
    email:'',
    createdAt:'',
    enabled:false,
    verified:false,
    roleId:0,
    roleName:'',
    accountTypeId:0,
    accountTypeName:'',
    action:''
  }]);

  useEffect(() => {GetUsers();},[]);

  async function GetUsers() {
    if (showDataTable === 'block') setShowDataTable('none');
    if (showTableSkeleton === 'none') setShowTableSekeleton('block'); 
    const usersRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users/getall`, {mode:'cors'});
    const usersResponse = await usersRequest.json();
    if (usersResponse.code === 200) {
      const users = usersResponse.data.map((user, index) => (
        {
          id:String(index),
          userId:user.users_id,
          firstName:user.users_first_name,
          lastName:user.users_last_name,
          email:user.users_email,
          createdAt:user.users_created_at,
          roleId:user.roles_id,
          roleName:user.roles_name,
          accountTypeId:user.at_id,
          accountTypeName:user.at_name,
          enabled:user.users_enabled,
          enabledStatus:user.users_enabled ? 
            <div style={{display:'flex',alignItems:'center'}}><CircleFill fill='green'/>Yes</div>
            :
            <div style={{display:'flex',alignItems:'center'}}><Caution fill='red'/>No</div>,
          verified:user.users_verified,
          verifiedStatus:user.users_verified ? 
            <div style={{display:'flex',alignItems:'center'}}><CheckmarkFilled fill='green'/>Yes</div>
            :
            <div style={{display:'flex',alignItems:'center'}}><Misuse fill='red'/>No</div>,
          action:<>
            <div style={{display:'flex', gap:'0.125rem'}}>
              <Button
                hasIconOnly
                kind='ghost'
                renderIcon={Edit}
                iconDescription='Edit'
                onClick={() => {
                  setEditUserData({
                    userId:user.users_id,
                    firstName:user.users_first_name,
                    lastName:user.users_last_name,
                    email:user.users_email,
                    createdAt:user.users_created_at,
                    enabled:user.users_enabled,
                    verified:user.users_verified,
                    role:'',
                    accountType:''
                  })
                  setShowRightPane('translateX(0rem)');
                }}
              />
              <Button
                hasIconOnly
                kind='danger--ghost'
                renderIcon={TrashCan}
                iconDescription='Delete'
                onClick={() => {
                  userToDelete.current = {userId:user.users_id,name:`${user.users_first_name} ${user.users_last_name}`};
                  setDeleteModalOpen(true);
                }}
              />
            </div>
          </>
        }
      ));
      setUsers(users);
      setShowDataTable('block');
      setShowTableSekeleton('none');
    };
    if (usersResponse.code !== 200) {
      setErrorInfo({heading:`Error: ${usersResponse.code}`,message:usersResponse.message})
      setErrorModalOpen(true);
    }
  }

  async function DeleteUser() {
    if (deleteModalOpen) setDeleteModalOpen(false);
    const deleteRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users/delete`,{
      method:'DELETE',
      mode:'cors',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(userToDelete.current)
    });
    const deleteResponse = await deleteRequest.json();
    userToDelete.current = {userId:'',name:''};
    if (deleteResponse.code === 200) GetUsers();
    if (deleteResponse.code !== 200) {
      setErrorInfo({heading:`Error: ${deleteResponse.code}`,message:deleteResponse.message})
      setErrorModalOpen(true);
    }
  }
  return (
    <>
      <Modal
        id='ErrorModal'
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
        id='confirmDelete'
        danger
        size='sm'
        open={deleteModalOpen}
        modalLabel='Confirm Delete'
        modalHeading={`Are you sure you want to delete ${userToDelete.current.name}?`}
        primaryButtonText="Delete"
        secondaryButtonText="Cancel"
        onRequestClose={() => {
          userToDelete.current = {userId:'',name:''};
          setDeleteModalOpen(false);
        }}
        onRequestSubmit={() => DeleteUser()}
      />
      <AdminHeader activeSideBarItem="users"/>
      <Content className='pageContent'>
        <div style={{display:showDataTable}}> 
          <DataTable rows={users} headers={usersHeader} isSortable>
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
                title='Users'
                description='Displays a list of all users registered in the database.'
              >
                <TableToolbar {...getToolbarProps()} aria-label="data table toolbar">
                  <TableToolbarContent>
                    <TableToolbarSearch onChange={onInputChange}/>
                  </TableToolbarContent>
                </TableToolbar>
                <Table {...getTableProps()}>
                  <TableHead>
                    <TableRow>
                      {headers.map(header => (
                        <TableHeader key={header.key} {...getHeaderProps({ header })}>
                          {header.header}
                        </TableHeader>
                      ))}
                      <TableHeader />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map(row => (
                      <TableRow key={row.id} {...getRowProps({ row })}>
                        {row.cells.map(cell => (
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
            headers={usersHeader}
          />
        </div>
        <div className='rightPane' style={{transform:showRightPane}}>
          <div className='closeButtonContainer'>
            <div>
              <CloseOutline 
                className='closeButton'
                size={28}
                onClick={() => {
                  setShowRightPane('translateX(35rem)');
                  setEditUserData({
                    userId:0,
                    firstName:'',
                    lastName:'',
                    email:'',
                    createdAt:'',
                    enabled:false,
                    verified:false,
                    role:'',
                    accountType:''
                  })
                }}
              />
            </div>
          </div>
          <div className='rightPaneContent'>
            <div>
              <p><strong>{`${editUserData.firstName} ${editUserData.lastName}`}</strong></p>
            </div>
            <hr/>
            <Form>
              <Stack gap={5}>
                <div style={{display:'flex', gap:'2rem'}}>
                  <TextInput
                    id="fName"
                    labelText="First Name"
                    value={editUserData.firstName}
                    onChange={event => setEditUserData(previousState => ({...previousState, firstName:event.target.value}))}
                  />
                  <TextInput
                    id="lName"
                    labelText="Last Name"
                    value={editUserData.lastName}
                    onChange={event => setEditUserData(previousState => ({...previousState, firstName:event.target.value}))}
                  />
                </div>
                <TextInput
                  id="email"
                  readyOnly
                  labelText="E-mail Address"
                  value={editUserData.email}
                />
                <TextInput
                  id="createdAt"
                  readyOnly
                  labelText="Account Created"
                  value={editUserData.createdAt}
                />
                <Tile id="status">
                  Account Status
                  <hr/>
                  <div style={{display:'flex', justifyContent:'space-evenly'}}>

                    <Toggle 
                      id='accountEnabled'
                      labelText="Account Login"
                      labelA="Disabled"
                      labelB="Enabled"
                      toggled={editUserData.enabled}
                      onToggle={event => setEditUserData(previousState => ({...previousState, enabled:event}))}
                    />
                    <Toggle 
                      id='accountVerified'
                      labelText="Account Verified"
                      labelA="Unverified"
                      labelB="Verified"
                      toggled={editUserData.verified}
                      onToggle={event => setEditUserData(previousState => ({...previousState, verified:event}))}
                    />
                    </div>
                </Tile>
                {/* <ComboBox
                  id="facilityImage"
                  titleText="Image"
                  label="Select"
                  items={imageComboBoxItems}
                  selectedItem={addEditData.image}
                  itemToString={item => (item ? item.fileName : '')}
                  onChange={event => {
                    setAddEditData(previousState => ({...previousState, image:event.selectedItem}))
                    GetImage(event.selectedItem.fileName);
                  }}
                />
                <ComboBox
                  id="organization"
                  titleText="Assigned Organization"
                  label="Select"
                  items={organizationData}
                  selectedItem={addEditData.organization}
                  itemToString={item => (item ? item.name : '')}
                  onChange={event => {setAddEditData(previousState => ({...previousState, organization:event.selectedItem}))}}
                /> */}
                <Button onClick={() => {}}>Save</Button>
              </Stack>
            </Form>
          </div>
        </div>
      </Content>
    </>
  )

}