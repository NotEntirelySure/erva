import React, {useState, useEffect, useRef} from 'react';
import AdminHeader from '../../components/AdminHeader';
import {
  Button,
  ButtonSet,
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
  Caution,
  CheckmarkFilled,
  CircleFill,
  Edit,
  MailAll,
  Misuse,
  TrashCan
} from '@carbon/react/icons';

import { Transfer } from 'antd';

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
  const [showRightPane, setShowRightPane] = useState('translateX(60rem)');
  const [userRoles, setUserRoles] = useState([{id:0,name:''}]);
  const [accountTypes, setAccountTypes] = useState([{id:0,name:''}]);
  const [transferElementTarget, setTransferElementTarget] = useState([]);
  const [transferElementSource, setTransferElementSource] = useState([]);
  const [emailSent, setEmailSent] = useState(false);
  const [editUserData, setEditUserData] = useState({
    id:0,
    firstName:'',
    lastName:'',
    email:'',
    createdAt:'',
    enabled:false,
    verified:false,
    role:{id:0,name:''},
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
    const query = `
      query {
        getUsers {
          id
          firstName
          lastName
          email
          createdAt
          enabled
          verified
          role {
            id
            name
          }
          accountType {
            id
            name
          }
        }
      }
    `;
    const usersRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api`, {
      mode:'cors',
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({query})
    });
    const usersResponse = await usersRequest.json();
    if (usersResponse.data) {
      const users = usersResponse.data.getUsers.map((user, index) => (
        {
          id:String(index),
          userId:user.id,
          firstName:user.firstName,
          lastName:user.lastName,
          email:user.email,
          createdAt:user.createdAt,
          roleName:user.role.name,
          accountTypeName:user.accountType.name,
          enabled:user.enabled,
          enabledStatus:user.enabled ? 
            <div style={{display:'flex',alignItems:'center'}}><CircleFill fill='green'/>Yes</div>
            :
            <div style={{display:'flex',alignItems:'center'}}><Caution fill='red'/>No</div>,
          verified:user.verified,
          verifiedStatus:user.verified ? 
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
                    id:user.id,
                    firstName:user.firstName,
                    lastName:user.lastName,
                    email:user.email,
                    createdAt:user.createdAt,
                    enabled:user.enabled,
                    verified:user.verified,
                    role:{
                      id:user.role.id,
                      name:user.role.name
                    },
                    accountType:user.accountType
                  })
                  setShowRightPane('translateX(0rem)');
                  GetRightPaneData(user.id);
                }}
              />
              <Button
                hasIconOnly
                kind='danger--ghost'
                renderIcon={TrashCan}
                iconDescription='Delete'
                onClick={() => {
                  userToDelete.current = {
                    userId:user.id,
                    name:`${user.firstName} ${user.lastName}`
                  };
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
    if (usersResponse.errors) {
      setErrorInfo({
        heading:`Error: ${usersResponse.errors.code}`,
        message:usersResponse.errors.message
      })
      setErrorModalOpen(true);
    }
  }

  async function SendVerificationEmail() {
    
    const query = `
      query {
        sendVerificationEmail(address:"${editUserData.email}")
        }
    `;
    const emailRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api`, {
      mode:'cors',
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        Accept: "application/json"
      },
      body:JSON.stringify({query})
    });
    const emailResponse = await emailRequest.json();
    if (emailResponse.data.sendVerificationEmail) {
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 5000);
    }
  };
  
  async function DeleteUser() {
    const query = `
      mutation {
        deleteUser(userId: ${userToDelete.current.userId}) {
          success
          errorCode
          errorMessage
        }
      }
    `;
    if (deleteModalOpen) setDeleteModalOpen(false);
    const deleteRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api`, {
      mode:'cors',
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        Accept: "application/json"
      },
      body:JSON.stringify({query})
    });
    const deleteResponse = await deleteRequest.json();
    userToDelete.current = {userId:'',name:''};
    if (deleteResponse.data.deleteUser.success) GetUsers();
    if (!deleteResponse.data.deleteUser.success) {
      setErrorInfo({
        heading:`Error: ${deleteResponse.data.deleteUser.errorCode}`,
        message:deleteResponse.data.deleteUser.errorMessage
      });
      setErrorModalOpen(true);
    };
    if (deleteResponse.errors) {
      setErrorInfo({heading:`Error`,message:deleteResponse.errors[0].message});
      setErrorModalOpen(true);
    }
  };

  async function GetRightPaneData (userId) {
    const query = `
      query {
        getUserPermissions(userId: ${userId}) {
          permissionId
          facilityId
          facilityName
          facilityCity
        }
        getFacilities (getImages: false){
          id
          name
          city
        }
        getRoles {
          id
          name
        }
        getAccountTypes {
          id
          name
        }
      }
    `;
    const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    const dataRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api`, {
      mode:'cors',
      method:'POST',
      headers:{
        Authorization: `Bearer ${jwt}`,
        'Content-Type':'application/json',
        Accept: 'application/json'
      },
      body:JSON.stringify({ query })
    });
    const dataResponse = await dataRequest.json();
    if (dataResponse.data) {
      const userPermissions = dataResponse.data.getUserPermissions;
      const facilitySource = dataResponse.data.getFacilities;
      const targetPermissions = [];
      facilitySource.forEach(facility => {
        facility["key"] = String(facility.id);
        facility["title"] = `${facility.name}${facility.city ? ` (${facility.city})`:''}`
        const matchingPermission = userPermissions.find(permission => permission.facilityId === facility.id);
        if (matchingPermission) {
          targetPermissions.push(facility.key);
          Object.assign(facility, {permissionId: matchingPermission.permissionId});
        };
      });
      
      const roles = dataResponse.data.getRoles.map(role => (
        {
          id:role.id,
          name:role.name
        }
      ));
      
      const types = dataResponse.data.getAccountTypes.map(type => (
        {
          id:type.id,
          name:type.name
        }
      ));

      setTransferElementTarget(targetPermissions);
      setTransferElementSource(facilitySource);
      setUserRoles(roles);
      setAccountTypes(types);
      
    };
    if (dataResponse.errors) {
      setErrorInfo({heading:`Error`,message:dataResponse.errors[0].message});
      setErrorModalOpen(true);
    };
  }

  async function saveUserData() {

    const addPermissions = [];
    const deletePermissions = [];

    transferElementSource.forEach(permission => {
      //if the current permission object contains a permission key, but doesn't have an existing permissionId, it means that a permission was moved to the "assigned" column. Add the permission.
      if (transferElementTarget.includes(permission.key) && !permission.permissionId) {
        addPermissions.push({
          userId: parseInt(editUserData.id),
          facilityId:parseInt(permission.id)
        });
        return;
      };
      //if the current permission object doesn't contain a permission key, but does have a permissionId, it means that the permission object was moved to the "unassigned" column. Delete this permission.
      if (!transferElementTarget.includes(permission.key) && permission.permissionId) {
        deletePermissions.push({permissionId:parseInt(permission.permissionId)});
      };
    });
  
    const query = `
      mutation ($addValues: [addPermission]!, $deleteValues: [deletePermission]! $userData:UpdatedUserData!) {
        addUserPermissions(addValues: $addValues) {
          success
          userId
          errorCode
          errorMessage
        }
        deleteUserPermissions(deleteValues: $deleteValues) {
          success
          permissionId
          errorCode
          errorMessage
        }
        updateUser(userData: $userData) {
          success
          userId
          errorCode
          errorMessage
        }
      }
    `;
    const saveDataRequest = fetch(`${process.env.REACT_APP_API_BASE_URL}/api`, {
      mode:'cors',
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        Accept: 'application/json'
      },
      body:JSON.stringify({
        query,
        variables: {
          addValues: addPermissions,
          deleteValues: deletePermissions,
          userData:editUserData
        }
      })
    });
    //this resolver needs to be created to hold the promise that's used for parallel processing of the request. 
    const promiseAllresover = await saveDataRequest;
    const saveDataResponse = await promiseAllresover.json();
    saveDataResponse.data.addUserPermissions.forEach((result) => {
      if (!result.success) {
        setErrorInfo({heading:`Error ${result.errorCode}`,message:result.errorMessage});
        setErrorModalOpen(true);
      };
    });
    saveDataResponse.data.deleteUserPermissions.forEach((result) => {
      if (!result.success) {
        setErrorInfo({heading:`Error ${result.errorCode}`,message:result.errorMessage});
        setErrorModalOpen(true);
      };
    });
    if (!saveDataResponse.data.updateUser.success) {
      setErrorInfo({heading:`Error ${saveDataResponse.data.updateUser.errorCode}`,message:saveDataResponse.data.updateUser.errorMessage});
        setErrorModalOpen(true);
    }
    if (saveDataResponse.data.updateUser.success) {
      GetUsers();
      closeRightPane();
    };
  };

  function closeRightPane() {
    setShowRightPane('translateX(60rem)');
    setEditUserData({
      id:0,
      firstName:'',
      lastName:'',
      email:'',
      createdAt:'',
      enabled:false,
      verified:false,
      role:{id:0,name:''},
      accountType:''
    });
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
        id='confirmDelete'
        danger
        size='xs'
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
          <div className='rightPaneHeader'>
            <div>
              
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
                    onChange={event => setEditUserData(previousState => ({...previousState, lastName:event.target.value}))}
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
                <div style={{display:'flex', gap:'1rem'}}>
                  <div style={{width:'60%'}}>
                    <Tile id="status">
                      Account Status
                      <hr/>
                      <div style={{display:'flex',gap:'1rem',flexDirection:'column'}}>
                        <div>
                          <Toggle 
                            id='accountEnabled'
                            labelText="Account Login"
                            labelA="Disabled"
                            labelB="Enabled"
                            toggled={editUserData.enabled}
                            onToggle={event => setEditUserData(previousState => ({...previousState, enabled:event}))}
                          />
                        </div>
                        <div style={{display:'flex', gap:'1rem'}}>
                          <div>
                            Account Verified?
                            {editUserData.verified ? <div style={{display:'flex',alignItems:'center'}}><CheckmarkFilled fill='green'/>Yes</div>:<div style={{display:'flex',alignItems:'center'}}><Misuse fill='red'/>No</div>}
                          </div>
                          <div>
                            <Button
                              disabled={editUserData.verified}
                              renderIcon={MailAll}
                              iconDescription="Send verification email"
                              onClick={() => SendVerificationEmail()}
                              size='sm'
                            >Send email
                            </Button>
                          </div>
                          {emailSent && (
                            <>
                              <div style={{display:'flex', alignItems:'center', gap:'0.25rem'}}>
                                <CheckmarkFilled fill='green'/>
                                <p style={{fontSize:'0.8rem'}}>email sent!</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </Tile>
                  </div>
                  <div>
                    <ComboBox
                      id="userRole"
                      titleText="Account Role"
                      label="Select"
                      items={userRoles}
                      selectedItem={editUserData.role}
                      itemToString={item => (item ? item.name : '')}
                      onChange={event => setEditUserData(previousState => ({...previousState, role:event.selectedItem}))}
                    />
                    <br/>
                    <ComboBox
                      id="accountType"
                      titleText="Acconut Type"
                      label="Select"
                      items={accountTypes}
                      selectedItem={editUserData.accountType}
                      itemToString={item => (item ? item.name : '')}
                      onChange={event => setEditUserData(previousState => ({...previousState, accountType:event.selectedItem}))}
                    />
                  </div>
                </div>
                <div className='userPermissions'>
                <Tile id="status">
                  User Permissions
                  <hr/>
                  <Transfer
                    listStyle={{width:'15vw', minWidth:'10rem', height:'25rem'}}
                    dataSource={transferElementSource}
                    showSearch
                    targetKeys={transferElementTarget}
                    onChange={item => {
                      console.log(item);
                      setTransferElementTarget(item);
                    }}
                    onSearch={() => {}}
                    render={item => item.title}
                    titles={['Available Permissions','Assigned Permissions']}
                  />
                </Tile>
                </div>
                <div><hr/></div>
                <ButtonSet>
                  <Button onClick={() => saveUserData()} kind="primary">Save</Button>
                  <Button onClick={() => closeRightPane()} kind="secondary">Close</Button>
                </ButtonSet>
              </Stack>
            </Form>
          </div>
        </div>
      </Content>
    </>
  )
}