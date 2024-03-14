import React, { useState, useEffect, useRef } from 'react';
import AdminHeader from '../../components/AdminHeader';
import {
  Button,
  ButtonSet,
  ComboBox,
  Content,
  DataTable,
  Dropdown,
  FileUploader,
  Form,
  Loading,
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
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
  TextInput,
  Tile,
  DataTableSkeleton,
} from '@carbon/react';
import {
  Add,
  Building,
  Edit,
  Image,
  NoImage,
  TrashCan,
  Upload
} from '@carbon/react/icons';

export default function AdminFacilitiesPage() {

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
  
  const facilitiesTableHeader = [
    {key:'facilityId', header:'Facility ID'},
    {key:'name', header:'Name'},
    {key:'organization', header:'Assigned Organization'},
    {key:'code', header:'Facility Code'},
    {key:'address', header:'Address'},
    {key:'city', header:'City'},
    {key:'state', header:'State'},
    {key:'zip', header:'Zip Code'},
    {key:'action', header:'Action'}
  ]

  const emptyFacilityData = {
    action:"",
    id:"",
    name:"",
    organization:"",
    code:"",
    address:"",
    city:"",
    state:"",
    zip:"",
    image:{fileName:''},
    lat:0,
    long:0
  }
  const defaultValidationVals = {
    nameInvalid:false,
    addressInvalid:false,
    cityInvalid:false,
    stateInvalid:false,
    zipInvalid:false
  };

  const fileUploaderRef = useRef();

  const [organizationData, setOrganizationData] = useState([{organizationId:-1,name:''}]);
  const [facilityData, setFacilityData] = useState([emptyFacilityData]);
  const [faciliityImage, setFacilityImage] = useState({imageData:'',fileName:''});
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [facilityModData, setFacilityModData] = useState(emptyFacilityData);
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);
  const [showDataTable, setShowDataTable] = useState('none');
  const [showTableSkeleton, setShowTableSekeleton] = useState('block');
  const [showRightPane, setShowRightPane] = useState('translateX(60rem)');
  const [showImageTable, setShowImageTable] = useState('none');
  const [showImageTableSkeleton, setShowImageTableSkeleton] = useState('block')
  const [showImage, setShowImage] = useState('none');
  const [showImageLoading, setShowImageLoading] = useState('none');
  const [imageComboBoxItems, setImageComboBoxItems] = useState([{fileName:'initialLoad'}])
  const [imageListData, setImageListData] = useState([]);
  const [confirmDeleteImageModalOpen, setConfirmDeleteImageModalOpen] = useState(false);
  const [imagePreviewModalOpen, setImagePreviewModalOpen] = useState(false);
  const [imageUploadModalOpen, setImageUploadModalOpen] = useState(false);
  const [modImageData, setModImageData] = useState({action:'', data:'', name:''});
  const [fileUploadStatus, setFileUploadStatus] = useState('edit');
  const [imageUploadButtonDisabled, setImageUploadButtonDisabled] = useState(true);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorInfo, setErrorInfo] = useState({heading:'',message:''});
  const [formValidation, setFormValidation] = useState(defaultValidationVals);

  useEffect(() => {
    if (showDataTable === 'block') setShowDataTable('none');
    if (showTableSkeleton === 'none') setShowTableSekeleton('block');
    GetOrganizations();
  },[]);
  
  //I don't want to have the image list contengent on the organization data. It needs to be pulled when the person clicks the edit button, not when the org data changes. It's causing unnecessary data pulls by having it tied to organizationData.
  useEffect(() => {GetImageList('combobox');},[organizationData]);
  useEffect(() => {GetFacilities();},[imageComboBoxItems]);

  async function GetOrganizations() {
    if (showDataTable === 'block') setShowDataTable('none');
    if (showTableSkeleton === 'none') setShowTableSekeleton('block'); 
    const query = `
      query {
        getOrganizations {
          id
          name
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
      body: JSON.stringify({ query })
    });
    const orgsResponse = await orgsRequest.json();
    const organizations = orgsResponse.data.getOrganizations.map(organization => (
      {
        organizationId:organization.id,
        name:organization.name
      }
    ));
    setOrganizationData(organizations);
  }

  async function GetFacilities() {
    if (showDataTable === 'block') setShowDataTable('none');
    if (showTableSkeleton === 'none') setShowTableSekeleton('block');

    const query = `
      query {
        getFacilities {
          id
          name
          address
          city
          state
          zip
          organization
          lat
          long
          image
          code
        }
      }`;

    const facilitiesRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api`,{
      mode:'cors',
      method:'POST',
      headers: {
        'Content-Type':'application/json',
        Accept: "application/json",
        Authorization:`Bearer {jwt}`,
      },
      body: JSON.stringify({ query })});

    const facilitiesResponse = await facilitiesRequest.json();
    const facilities = facilitiesResponse.data.getFacilities.map((facility, index) => (  
      {
        id:String(index),
        facilityId:facility.id,
        name:facility.name,
        organization:facility.organization ? organizationData.find(element => parseInt(element.organizationId) === facility.organization).name:'',
        code:facility.code,
        address:facility.address,
        city:facility.city,
        state:facility.state,
        zip:facility.zip,
        image:facility.image,
        lat:facility.lat,
        long:facility.long,
        action:<>
          <div>
            <Button
              hasIconOnly
              kind='ghost'
              renderIcon={Edit}
              iconDescription='Edit Facility'
              onClick={() => {
                setFacilityModData({
                  action:"edit",
                  id:facility.id,
                  name:facility.name,
                  organization: facility.organization ? 
                    organizationData.find(element => parseInt(element.organizationId) === facility.organization):
                    {organizationId:0,name:''},
                  code:facility.code,
                  address:facility.address,
                  city:facility.city,
                  state:states.find(element => element.value === facility.state),
                  zip:facility.zip,
                  image:imageComboBoxItems.find(element => element.fileName === facility.image),
                  lat:facility.lat,
                  long:facility.long
                });
                setShowRightPane('translateX(0rem)');
                GetImage(facility.image);
                if(imageComboBoxItems[0].fileName === 'initialLoad') GetImageList();
              }}
            />
            <Button
              hasIconOnly
              kind='danger--ghost'
              renderIcon={TrashCan}
              iconDescription={`Delete Facility`}
              onClick={() => {
                setFacilityModData(previousState => ({
                  ...previousState,
                  action:'delete',
                  id:facility.id,
                  name:facility.name
                }));
                setConfirmDeleteModalOpen(true);
              }}
            />
          </div>
        </>
     }
    ))
    setFacilityData(facilities);
    setShowTableSekeleton('none');
    setShowDataTable('block');
  }

  function VerifyForm() {
    let valid = true;
    switch (facilityModData.action) {
      case "add":
      case "edit":
        if (facilityModData.name === "" || facilityModData.name === null) {
          valid = false;
          setFormValidation(previousState => ({...previousState, nameInvalid:true}));
        };
        if (facilityModData.address === "" || facilityModData.address === null) {
          valid = false;
          setFormValidation(previousState => ({...previousState, addressInvalid:true}));
        };
        if (facilityModData.city === "" || facilityModData.city === null) {
          valid = false;
          setFormValidation(previousState => ({...previousState, cityInvalid:true}));
        };
        if (facilityModData.state === "" || facilityModData.state === null) {
          valid = false;
          setFormValidation(previousState => ({...previousState, stateInvalid:true}));
        };
        if (facilityModData.zip === "" || facilityModData.zip === null) {
          valid = false;
          setFormValidation(previousState => ({...previousState, zipInvalid:true}));
        };
        break;
      case "delete":
        break
    };
    if (!valid) return false;
    if (valid) return true;
  }

  async function ModifyFacility() {
    const isValid = VerifyForm();
    if (!isValid) return;
    if (addModalOpen) setAddModalOpen(false);
    if (showRightPane === 'translateX(0rem)') setShowRightPane('translateX(60rem)');

    const query = `
      mutation($data: ModFacility) {
        modFacility(facilityData:$data) {
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
        Authorization:'Bearer {jwt}'
      },
      body:JSON.stringify({
        query,
        variables: {
          data: {
            ...facilityModData,
            state:facilityModData.state?.value,
            image:facilityModData.image?.fileName,
            organization:parseInt(facilityModData.organization?.organizationId)
          }
        }
      })
    })
    const modResponse = await modRequest.json();
    setFacilityModData(emptyFacilityData);
    if (modResponse.data.modFacility.success) GetFacilities();
    if (!modResponse.data.modFacility.success) {
      setErrorInfo({
        heading:modResponse.data.modFacility.errorCode,
        message:modResponse.data.modFacility.errorMessage
      });
      setErrorModalOpen(true);
    };
  };

  async function GetImage(imageName) {

    if (showImage === 'block') setShowImage('none');
    if (showImageLoading === 'none') setShowImageLoading('block');
    const query = `
      query {
        getImage(type:"facility", name:"${imageName}") {
          name
          data
          success
          message
        }
      }
    `;
    const imageRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api`,{
      mode:'cors',
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        Accept:'application/json',
        Authorization:'Bearer: {jwt}'
      },
      body:JSON.stringify({ query })
    });
    const imageResponse = await imageRequest.json();
    if (!imageResponse.data.getImage.success) {
      setErrorInfo({heading:imageResponse.code,message:imageResponse.message})
      setErrorModalOpen(true);
      return;
    };
    setFacilityImage({
      imageData:imageResponse.data.getImage.data,
      fileName:imageResponse.data.getImage.name
    });
    setShowImageLoading('none');
    setShowImage('block');
  }

  async function GetImageList(request) {
    if (showImageTable === 'block') setShowImageTable('none');
    if (showImageTableSkeleton) setShowImageTableSkeleton('block');
    const query = `
      query {
        getImageList(type: "facility") {
          name
          createdAt
          size
        }
      }
    `;
    const listRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api`,{
      mode:'cors',
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        Accept:'application/json',
        Authorization:'Bearer: {jwt}'
      },
      body:JSON.stringify({ query })
    });
    const listResponse = await listRequest.json();

    if (request === 'combobox') {
      const comboBoxItems = listResponse.data.getImageList.map(image => ({fileName:image.name}))
      setImageComboBoxItems(comboBoxItems);
      return;
    };

    const imageList = listResponse.data.getImageList.map((item, index) => (
      {
        id:String(index),
        name:item.name,
        createdAt:item.createdAt,
        size:`${Math.round(((item.size)/1024 * 100))/100} ${(item.size)/1024 <= 1024 ? "KB":"MB"}`,
        action:<>
          <div style={{display:'flex', gap:'0.125rem'}}> 
            <Button 
              hasIconOnly
              kind='ghost'
              iconDescription='View Image'
              renderIcon={Image}
              onClick={() => {
                setImagePreviewModalOpen(true);
                GetImage(item.name);
              }}
            />
            <Button 
              hasIconOnly
              kind='danger--ghost'
              iconDescription='Delete Image'
              renderIcon={TrashCan}
              onClick={() => {
                setModImageData({
                  action:'delete',
                  type:'facility',
                  name:item.name
                })
                setConfirmDeleteImageModalOpen(true);
              }}
            />
          </div>
        </>
      }
    ));
    
    setImageListData(imageList);
    setShowImageTable('block');
    setShowImageTableSkeleton('none');
  }

  function HandleFileChange(event) {
    if (event === 'remove') {
      fileUploaderRef.current.clearFiles();
      setFileUploadStatus('edit');
      setFacilityImage({imageData:'',fileName:''});
      setModImageData({name:'', data:''})
      setImageUploadButtonDisabled(true);
      return;
    }
    setFileUploadStatus('uploading');
    const file = event.target.files[0];
    const fileName = event.target.value.split('\\')[2];
    if (fileName.split('.')[1] === "png" || fileName.split('.')[1] === "jpg" || fileName.split('.')[1] === "jpeg") {
      let fileReader = new FileReader();
      fileReader.onloadend = event => setModImageData({
        action:'upload',
        type:'facility',
        name:fileName,
        data:event.target.result,
      });
      fileReader.readAsDataURL(file);
      setFileUploadStatus('edit');
      setImageUploadButtonDisabled(false);
    };
  };

  async function ModImage() {
    if (imageUploadModalOpen) setImageUploadModalOpen(false);
    if (confirmDeleteImageModalOpen) setConfirmDeleteImageModalOpen(false);

    const query = `
      mutation ($data: ImageData) {
        modImage(imageData: $data) {
          success
          errorCode
          errorMessage
        }
      }
    `;

    const uploadRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api`,{
      mode:'cors',
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        Accept:'application/json',
        Authorization:'Bearer: {jwt}'
      },
      body:JSON.stringify({ 
        query,
        variables: { data: modImageData }
      })
    });
    const uploadResponse = await uploadRequest.json();
    fileUploaderRef.current.clearFiles();
    setModImageData({
      action:'',
      type:'',
      name:'',
      data:''
    });

    if (uploadResponse.data.modImage.success) GetImageList();
    if (!uploadResponse.data.modImage.success) {
      setErrorInfo({
        heading:uploadResponse.data.modImage.errorCode,
        message:uploadResponse.data.modImage.errorMessage
      });
      setErrorModalOpen(true);
    }
  }

  function CloseRightPane() {
    setFormValidation(defaultValidationVals);
    setFacilityImage({imageData:'',fileName:''});
    setShowRightPane('translateX(60rem)');
    setFacilityModData(emptyFacilityData);
  };

  return (
    <>
      <Modal
        id='ErrorModal'
        size='sm'
        open={errorModalOpen}
        modalHeading={errorInfo.heading}
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
        children={<><p>{errorInfo.message}</p></>}
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
          setFacilityModData(emptyFacilityData);
        }}
        onRequestSubmit={() => {
          setConfirmDeleteModalOpen(false);
          ModifyFacility();
        }}
        primaryButtonText='Delete'
        secondaryButtonText='Cancel'
        children={`Are you sure you want to delete ${facilityModData.name}?`}
      />
      <Modal
        id="addModal"
        size='sm'
        open={addModalOpen}
        modalHeading="Add Facility"
        modalAriaLabel="Add modal"
        onRequestClose={() => {
          setAddModalOpen(false);
          setFormValidation(defaultValidationVals);
          setFacilityModData(emptyFacilityData);
        }}
        onRequestSubmit={() => ModifyFacility()}
        primaryButtonText="Add"
        secondaryButtonText="Cancel"
        children={
          <Form>
            <Stack gap={5}>
              <TextInput
                id="name"
                labelText="Name"
                value={facilityModData.name}
                invalid={formValidation.nameInvalid}
                invalidText={"Please enter a facility name"}
                onChange={event => {
                  if (formValidation.nameInvalid) setFormValidation(previousState => ({...previousState, nameInvalid:false}));
                  setFacilityModData(previousState => ({...previousState, name:event.target.value}));
                }}
              />
              <TextInput
                id="address"
                labelText="Address"
                value={facilityModData.address}
                invalid={formValidation.addressInvalid}
                invalidText="Please enter an address"
                onChange={event => {
                  if (formValidation.addressInvalid) setFormValidation(previousState => ({...previousState, addressInvalid:false}));
                  setFacilityModData(previousState => ({...previousState, address:event.target.value}));
                }}
              />
              <div style={{display:'grid', gap:'2rem', alignItems:'baseline', gridTemplateColumns:'2fr 1.5fr 1fr'}}>
                <div>
                  <TextInput
                    id="city"
                    labelText="City"
                    value={facilityModData.city}
                    invalid={formValidation.cityInvalid}
                    invalidText="Please enter a city"
                    onChange={event => {
                      if (formValidation.cityInvalid) setFormValidation(previousState => ({...previousState, cityInvalid:false}));
                      setFacilityModData(previousState => ({...previousState, city:event.target.value}));
                    }}
                  />
                </div>
                <div> 
                  <Dropdown
                    id="state"
                    titleText="State"
                    label="Select"
                    items={states}
                    selectedItem={facilityModData.state}
                    itemToString={item => (item ? item.text : '')}
                    invalid={formValidation.stateInvalid}
                    invalidText="Please select a state"
                    onChange={event => {
                      if (formValidation.stateInvalid) setFormValidation(previousState => ({...previousState, stateInvalid:false}));
                      setFacilityModData(previousState => ({...previousState, state:event.selectedItem}));
                    }}
                  />
                </div>
                <div>
                  <TextInput
                    id="zip"
                    labelText="Zip"
                    value={facilityModData.zip}
                    invalid={formValidation.zipInvalid}
                    invalidText="Please enter a zip code"
                    onChange={event => {
                      if (formValidation.zipInvalid) setFormValidation(previousState => ({...previousState, zipInvalid:false}));
                      setFacilityModData(previousState => ({...previousState, zip:event.target.value}));
                  }}
                  />
                </div>
              </div>
              <div style={{display:'flex', gap:'2rem'}}>
                <div>
                  <TextInput
                    id="latitude"
                    labelText="Latitude"
                    value={facilityModData.lat}
                    onChange={event => setFacilityModData(previousState => ({...previousState, lat:event.target.value}))}
                  />
                </div>
                <div>
                  <TextInput
                    id="longitude"
                    labelText="Longitude"
                    value={facilityModData.long}
                    onChange={event => setFacilityModData(previousState => ({...previousState, long:event.target.value}))}
                  />
                </div>
              </div>
              <ComboBox
                id="facilityImage"
                titleText="Image"
                label="Select"
                items={imageComboBoxItems}
                selectedItem={facilityModData.image}
                itemToString={item => (item ? item.fileName : '')}
                onChange={event => {
                  setFacilityModData(previousState => ({...previousState, image:event.selectedItem}))
                  GetImage(event.selectedItem.fileName);
                }}
              />
              <ComboBox
                id="organization"
                titleText="Assigned Organization"
                label="Select"
                items={organizationData}
                selectedItem={facilityModData.organization}
                itemToString={item => (item ? item.name : '')}
                onChange={event => {
                  setFacilityModData(previousState => ({...previousState, organization:event.selectedItem}))}
                }
              />
              <TextInput
                id="code"
                labelText="Facility Code"
                value={facilityModData.code}
                onChange={event => setFacilityModData(previousState => ({...previousState, code:event.target.value}))}
              />
            </Stack>
          </Form>
        }
      />
      <Modal
        id="ConfirmDeleteImageModal"
        danger
        size='sm'
        open={confirmDeleteImageModalOpen}
        modalHeading='Confirm Delete'
        modalAriaLabel="confirm delete image modal"
        onRequestClose={() => {
          setConfirmDeleteImageModalOpen(false);
          setModImageData({
            action:'',
            name:'',
            data:''
          });
        }}
        onRequestSubmit={() => ModImage()}
        primaryButtonText='Delete'
        secondaryButtonText='Cancel'
        children={`Are you sure you want to delete ${modImageData.name}?`}
      />
      <Modal
        id="imagePreviewModal"
        open={imagePreviewModalOpen}
        modalHeading={faciliityImage.fileName}
        modalAriaLabel="image preview"
        onRequestClose={() => {
          setImagePreviewModalOpen(false);
          //delay clearing the image data so the modal displays correctly until not visible.
          setTimeout(() => setFacilityImage({imageData:'',fileName:''}),750);
        }}
        onRequestSubmit={() => {
          setImagePreviewModalOpen(false);
          //delay clearing the image data so the modal displays correctly until not visible.
          setTimeout(() => setFacilityImage({imageData:'',fileName:''}),750);
        }}
        primaryButtonText='Close'
        children={
          <div style={{display:'flex', justifyContent:'center', alignContent:'center'}}>
            <div style={{display:showImage}}>
                <img style={{maxWidth:'45vh'}} alt={'image'} src={`data:image/png;base64,${faciliityImage.imageData}`}/>
            </div>
            <div style={{display:showImageLoading}}>
              <Loading withOverlay={false}/>
            </div>
          </div>
        }
      />
      <Modal
        id="imageUploadModal"
        open={imageUploadModalOpen}
        modalHeading="Facility Image Upload"
        modalAriaLabel="facility image upload"
        onRequestClose={() => {
          setImageUploadModalOpen(false);
          HandleFileChange('remove');
        }}
        onRequestSubmit={() => ModImage()}
        primaryButtonText='Upload'
        secondaryButtonText='Cancel'
        primaryButtonDisabled={imageUploadButtonDisabled}
        children={
          <>
            <div style={{
              display:showImage, 
              display:'flex', 
              justifyContent:'center',
              alignItems:'center',
              height:'15rem'}}
            >
              {
                modImageData.data ?
                  <img style={{maxWidth:'auto', maxHeight:'25vh'}} alt={'image'} src={modImageData.data}/>:
                  <div><NoImage size={128} fill='lightgray'/></div>
              }
            </div>
            <div className="cds--file__container">
              <FileUploader
                ref={fileUploaderRef}
                labelTitle="Upload Image"
                labelDescription="Max file size is 2mb. Only .jpg and .png files are supported."
                buttonLabel="Add image file"
                buttonKind="primary"
                size="md"
                filenameStatus={fileUploadStatus}
                accept={['.jpg', '.png']}
                multiple={false}
                disabled={false}
                iconDescription="Delete file"
                name=""
                onChange={event => HandleFileChange(event)}
                onDelete={() => HandleFileChange('remove')}
              />
            </div>
          </>
        }
      />
      <AdminHeader activeSideBarItem="facilities"/>
      <Content className='pageContent'>
        <Tabs>
          <TabList aria-label="List of tabs">
            <Tab><Building size={18}/> Facilities</Tab>
            <Tab 
              onClick={() => {
                GetImageList();
                if (showRightPane === 'translateX(0rem)') setShowRightPane('translateX(60rem)');
                setFacilityModData(emptyFacilityData);
              }}
            >
              <Image size={18}/> Images
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <div style={{display:showDataTable}}> 
                <DataTable rows={facilityData} headers={facilitiesTableHeader} isSortable>
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
                      title='Facilities'
                      description='Displays a list of all facilities registered in the database.'
                    >
                      <TableToolbar {...getToolbarProps()} aria-label="data table toolbar">
                        <TableToolbarContent>
                          <TableToolbarSearch onChange={onInputChange}/>
                          <Button
                            hasIconOnly
                            aria-label='add faciliity'
                            iconDescription='Add Facility'
                            renderIcon={Add}
                            onClick={() => {
                              setFacilityModData({
                                action:"add",
                                name:"",
                                organization:"",
                                code:"",
                                address:"",
                                city:"",
                                state:"",
                                zip:"",
                                image:'',
                                lat:0,
                                long:0
                              });
                              setAddModalOpen(true);
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
                  headers={facilitiesTableHeader}
                />
              </div>
              <div className='rightPane' style={{transform:showRightPane}}>
                <div className='rightPaneHeader'>
                  <div style={{display:'flex', alignItems:'center'}}>
                    <div style={{display:showImage}}>
                      <Tile>
                        <img className="tileImage" alt={'image'} src={`data:image/png;base64,${faciliityImage.imageData}`}></img>
                      </Tile>
                    </div>
                    <div style={{display:showImageLoading}}>
                      <Loading withOverlay={false} />
                    </div>
                  </div>
                </div>
                <div className='rightPaneContent'>
                  <p><strong>{facilityModData.name}</strong></p>
                  <hr/>
                  <Form>
                    <Stack gap={5}>
                      <TextInput
                        id="name"
                        labelText="Name"
                        value={facilityModData.name}
                        invalid={formValidation.nameInvalid}
                        invalidText="Name field cannot be blank"
                        onChange={event => {
                          if (formValidation.nameInvalid) setFormValidation(previousState => ({...previousState, nameInvalid:false}));
                          setFacilityModData(previousState => ({...previousState, name:event.target.value}))
                        }}
                      />
                      <ComboBox
                        id="facilityImage"
                        titleText="Image"
                        label="Select"
                        items={imageComboBoxItems}
                        selectedItem={facilityModData.image}
                        itemToString={item => (item ? item.fileName : '')}
                        onChange={event => {
                          setFacilityModData(previousState => ({...previousState, image:event.selectedItem}))
                          if (event.selectedItem) GetImage(event.selectedItem.fileName);
                        }}
                      />
                      <ComboBox
                        id="organization"
                        titleText="Assigned Organization"
                        label="Select"
                        items={organizationData}
                        selectedItem={facilityModData.organization}
                        itemToString={item => (item ? item.name : '')}
                        onChange={event => {setFacilityModData(previousState => ({...previousState, organization:event.selectedItem}))}}
                      />
                      <TextInput
                        id="address"
                        labelText="Address"
                        value={facilityModData.address}
                        invalid={formValidation.addressInvalid}
                        invalidText='Address is a required field'
                        onChange={event => {
                          if (formValidation.addressInvalid) setFormValidation(previousState => ({...previousState, addressInvalid:false}));
                          setFacilityModData(previousState => ({...previousState, address:event.target.value}))}
                        }
                      />
                      <div style={{display:'grid', gap:'2rem', alignItems:'baseline', gridTemplateColumns:'2fr 1.5fr 1fr'}}>
                        <div>
                          <TextInput
                            id="city"
                            labelText="City"
                            value={facilityModData.city}
                            invalid={formValidation.cityInvalid}
                            invalidText='City is a required field'
                            onChange={event => {
                              if (formValidation.cityInvalid) setFormValidation(previousState => ({...previousState, cityInvalid:false}));
                              setFacilityModData(previousState => ({...previousState, city:event.target.value}));
                            }}
                          />
                        </div>
                        <div> 
                          <Dropdown
                            id="state"
                            titleText="State"
                            label="Select"
                            items={states}
                            selectedItem={facilityModData.state}
                            itemToString={item => (item ? item.text : '')}
                            invalid={formValidation.stateInvalid}
                            invalidText='State is a required fild'
                            onChange={event => {
                              if (formValidation.stateInvalid) setFormValidation(previousState => ({...previousState, stateInvalid:false}));
                              setFacilityModData(previousState => ({...previousState, state:event.selectedItem}));
                            }}
                          />
                        </div>
                        <div>
                          <TextInput
                            id="zip"
                            labelText="Zip"
                            value={facilityModData.zip}
                            invalid={formValidation.zipInvalid}
                            invalidText='Zip code is a required field'
                            onChange={event => {
                              if (formValidation.zipInvalid) setFormValidation(previousState => ({...previousState, zipInvalid:false}));
                              setFacilityModData(previousState => ({...previousState, zip:event.target.value}));
                            }}
                          />
                        </div>
                      </div>
                      <div style={{display:'flex', gap:'2rem'}}>
                        <div>
                          <TextInput
                            id="latitude"
                            labelText="Latitude"
                            value={facilityModData.lat}
                            onChange={event => setFacilityModData(previousState => ({...previousState, lat:event.target.value}))}
                            />
                        </div>
                        <div>
                          <TextInput
                            id="longitude"
                            labelText="Longitude"
                            value={facilityModData.long}
                            onChange={event => setFacilityModData(previousState => ({...previousState, long:event.target.value}))}
                            />
                        </div>
                      </div>
                      <TextInput
                        id="code"
                        labelText="Facility Code"
                        value={facilityModData.code}
                        onChange={event => setFacilityModData(previousState => ({...previousState, code:event.target.value}))}
                        />
                        <div><hr/></div>
                        <ButtonSet>
                          <Button onClick={() => ModifyFacility()} kind="primary">Save</Button>
                          <Button onClick={() => CloseRightPane()} kind="secondary">Close</Button>
                        </ButtonSet>
                    </Stack>
                  </Form>
                </div>
              </div>
            </TabPanel>
            <TabPanel>
              <div style={{display:showImageTable}}> 
                <DataTable 
                  isSortable
                  rows={imageListData} 
                  headers={[
                    {key:'name', header:'Image Name'},
                    {key:'createdAt', header:'Date Created'},
                    {key:'size', header:'Size'},
                    {key:'action', header:'Action'}
                  ]} 
                >
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
                      title='Facility Images'
                      description='Displays a list of all facility images.'
                    >
                      <TableToolbar {...getToolbarProps()} aria-label="data table toolbar">
                        <TableToolbarContent>
                          <TableToolbarSearch onChange={onInputChange} />
                          <Button
                            hasIconOnly
                            aria-label='upload image'
                            iconDescription='Upload Image'
                            renderIcon={Upload}
                            onClick={() => setImageUploadModalOpen(true)}
                          />
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
              <div style={{display:showImageTableSkeleton}}>
                <DataTableSkeleton
                  showHeader
                  showToolbar
                  headers={[
                    {key:'name', header:'Image Name'},
                    {key:'createdAt', header:'Date Created'},
                    {key:'size', header:'Size'},
                    {key:'action',header:'Action'}
                  ]}
                />
              </div>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Content>
    </>
  );
};