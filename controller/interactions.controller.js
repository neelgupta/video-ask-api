const { response400, response201, response200 } = require("../lib/response-messages");
const { uploadVideoToCloudinary } = require("../lib/uploader/upload");
const catchAsyncError = require("../middleware/catchAsyncError");
const { organization_services, interactions_services } = require("../service");
const { msg, CloudFolder, nodeType } = require("../utils/constant");


const addFolder = catchAsyncError(async (req, res) => {
    const Id = req.user;
    const { organization_id } = req.body;
    const organizationData = await organization_services.get_organization({ _id: organization_id, is_deleted: false, });
    if (!organizationData) return response400(res, msg.organizationNotExists);

    req.body.added_by = Id;

    const data = await interactions_services.add_folder(req.body);

    return response201(res, msg.folderAdded, data);
});

const getFolderList = catchAsyncError(async (req, res) => {
    const { organization_id } = req.params;

    const organizationData = await organization_services.get_organization({ _id: organization_id, is_deleted: false, });
    if (!organizationData) return response400(res, msg.organizationNotExists);

    const data = await interactions_services.get_folder_list({ organization_id, is_deleted: false }, { __v: 0, updatedAt: 0 });

    if (data?.length) {
        await Promise.all(data.map(async (val) => {
            const interactionCounts = await interactions_services.get_interaction_counts({ folder_id: val._id, is_deleted: false });
            val.count = interactionCounts;
        }));
    }

    return response200(res, msg.fetch_success, data);
});

const updateFolder = catchAsyncError(async (req, res) => {
    const { folder_id } = req.body;

    const folderData = await interactions_services.get_single_folder({ _id: folder_id, is_deleted: false });
    if (!folderData) return response400(res, msg.folderIsNotExists);

    await interactions_services.update_folder({ _id: folder_id, }, req.body);

    return response200(res, msg.update_success, [])
});

const deleteFolder = catchAsyncError(async (req, res) => {
    const { folder_id } = req.params;

    const folderData = await interactions_services.get_single_folder({ _id: folder_id, is_deleted: false });
    if (!folderData) return response400(res, msg.folderIsNotExists);

    await interactions_services.update_folder({ _id: folder_id, }, { is_deleted: true });

    return response200(res, msg.delete_success, [])
});

const createInteraction = catchAsyncError(async (req, res) => {
    const Id = req.user;
    const { organization_id, folder_id, flows } = req.body;

    const folderData = await interactions_services.get_single_folder({ _id: folder_id, organization_id, is_deleted: false });
    if (!folderData) return response400(res, msg.folderIsNotExists);

    const organizationData = await organization_services.get_organization({ _id: organization_id, is_deleted: false, });
    if (!organizationData) return response400(res, msg.organizationNotExists);

    req.body.added_by = Id;

    const interactionData = await interactions_services.add_new_interaction(req.body);

    if (flows?.length) {
        let targetId;
        let sourceId;
        await Promise.all(flows.map(async (val) => {
            if (val.type === nodeType.Start) {
                const nodeData = await interactions_services.add_Node({ interaction_id: interactionData._id, node_type: val.type, position: val.position, title: val.title, added_by: Id });
                sourceId = nodeData._id
            }

            if (val.type === nodeType.End) {
                const nodeData = await interactions_services.add_Node({ interaction_id: interactionData._id, node_type: val.type, position: val.position, title: val.title, added_by: Id });
                targetId = nodeData._id;
            }
        }))

        if (targetId && sourceId) {
            await interactions_services.add_Edge({ interaction_id: interactionData._id, source: sourceId, target: targetId, added_by: Id });
        }
    }

    return response201(res, msg.interactionAdded, interactionData);
});

const getInteractionList = catchAsyncError(async (req, res) => {
    const Id = req.user;
    const { folder_id } = req.params;

    const folderData = await interactions_services.get_single_folder({ _id: folder_id, is_deleted: false });
    if (!folderData) return response400(res, msg.folderIsNotExists);

    const data = await interactions_services.get_all_interactions({ folder_id, is_deleted: false, added_by: Id }, { updatedAt: 0, __v: 0 });

    return response200(res, msg.fetch_success, data);
});

const updateInteraction = catchAsyncError(async (req, res) => {
    const { folder_id, interaction_id } = req.body;

    const folderData = await interactions_services.get_single_folder({ _id: folder_id, is_deleted: false });
    if (!folderData) return response400(res, msg.folderIsNotExists);

    const interactionData = await interactions_services.get_single_interaction({ _id: interaction_id, is_deleted: false });
    if (!interactionData) return response400(res, msg.interactionIsNotExists);

    await interactions_services.update_interaction({ _id: interaction_id }, req.body);

    return response200(res, msg.update_success, [])
});

const deleteInteraction = catchAsyncError(async (req, res) => {
    const { interaction_id } = req.params;

    const interactionData = await interactions_services.get_single_interaction({ _id: interaction_id, is_deleted: false });
    if (!interactionData) return response400(res, msg.interactionIsNotExists);

    await interactions_services.update_interaction({ _id: interaction_id }, { is_deleted: true });

    return response200(res, msg.delete_success, []);
});

const createFlow = catchAsyncError(async (req, res) => {
    const Id = req.user;
    //  added_by, flow_type, video_thumbnail, video_url, video_align, overlay_text, text_size, fade_reveal
    const { interaction_id } = req.body;

    const interactionData = await interactions_services.get_single_interaction({ _id: interaction_id, is_deleted: false });
    if (!interactionData) return response400(res, msg.interactionIsNotExists);

    const folderData = await interactions_services.get_single_folder({ _id: interactionData.folder_id, is_deleted: false });

    req.body.added_by = Id;
    if (req.file) {
        const uploadedFile = await uploadVideoToCloudinary(req.file, `${CloudFolder}/${Id}/${folderData?.folder_name}`);
        req.body.video_thumbnail = uploadedFile.thumbnailUrl;
        req.body.video_url = uploadedFile.videoUrl;
    }

    const data = await interactions_services.add_flow(req.body)

    return response201(res, msg.flowCreated, data);
});

const getFlows = catchAsyncError(async (req, res) => {
    const { interaction_id } = req.params;

    const interactionData = await interactions_services.get_single_interaction({ _id: interaction_id, is_deleted: false });
    if (!interactionData) return response400(res, msg.interactionIsNotExists);

    const data = await interactions_services.get_flow_list({ interaction_id, is_deleted: false }, { updatedAt: 0, __v: 0 });

    return response200(res, msg.fetch_success, data);
});

const updateFlow = catchAsyncError(async (req, res) => {
    const { flow_id } = req.body;

    const flowData = await interactions_services.get_single_flow({ _id: flow_id, is_deleted: false });
    if (!flowData) return response400(res, msg.flowNotExists);

    const interactionData = await interactions_services.get_single_interaction({ _id: flowData?.interaction_id, is_deleted: false });
    if (!interactionData) return response400(res, msg.interactionIsNotExists);

    const folderData = await interactions_services.get_single_folder({ _id: interactionData.folder_id, is_deleted: false });

    if (req.file) {
        const uploadedFile = await uploadVideoToCloudinary(req.file, `${CloudFolder}/${Id}/${folderData.folder_name}`);
        req.body.video_thumbnail = uploadedFile.thumbnailUrl;
        req.body.video_url = uploadedFile.videoUrl;
    }

    await interactions_services.update_flow({ _id: flow_id }, req.body);

    return response200(res, msg.update_success, []);
});

const removeFlow = catchAsyncError(async (req, res) => {
    const { flow_id } = req.body;

    const flowData = await interactions_services.get_single_flow({ _id: flow_id, is_deleted: false });
    if (!flowData) return response400(res, msg.flowNotExists);

    await interactions_services.update_flow({ _id: flow_id }, { is_deleted: true });

    return response200(res, msg.delete_success, []);
});

const createDefaultFlow = catchAsyncError(async (req, res) => {
    const Id = req.user;
    const { interaction_id, flows, } = req.body;

    const interactionData = await interactions_services.get_single_interaction({ _id: interaction_id, is_deleted: false });
    if (!interactionData) return response400(res, msg.interactionIsNotExists);


    if (flows?.length) {

        let targetId;
        let sourceId;
        await Promise.all(flows.map(async (val) => {
            // const payload = { interaction_id: interactionData._id, added_by: Id, title: val.title };
            // let targetId;
            // let sourceId;
            if (val.type === nodeType.Start) {
                const nodeData = await interactions_services.add_Node({ interaction_id: interaction_id, node_type: val.type, position: val.position, title: val.title, added_by: Id });
                sourceId = nodeData._id
            }

            if (val.type === nodeType.End) {
                const nodeData = await interactions_services.add_Node({ interaction_id: interaction_id, node_type: val.type, position: val.position, title: val.title, added_by: Id });
                targetId = nodeData._id;
            }

            // // const flowData = await interactions_services.add_flow(payload);

            // if (nodeData) {

            //     if (val.type === nodeType.Start && nodeData) {
            //         sourceId = nodeData._id
            //     };
            //     if (val.type === nodeType.End && nodeData) {
            //         console.log("before", targetId)
            //         // console.log("helllo ", nodeData._id)
            //         targetId = nodeData._id;
            //         console.log("after", targetId)
            //     }
            //     console.log("outer", targetId)
            // if (targetId && sourceId) {
            //     console.log("test",)
            //     await interactions_services.add_Edge({ interaction_id, source: sourceId, target: targetId, added_by: Id });
            // }
            // }

        }))

        if (targetId && sourceId) {
            await interactions_services.add_Edge({ interaction_id, source: sourceId, target: targetId, added_by: Id });
        }
    }

    return response200(res, msg.fetch_success, [])
});

const getInteractionDetails = catchAsyncError(async (req, res) => {
    const Id = req.user;
    const { interaction_id, } = req.params;

    const interactionData = await interactions_services.interaction_details(interaction_id);
    return response200(res, msg.fetch_success, interactionData)
});

module.exports = {
    addFolder,
    getFolderList,
    updateFolder,
    deleteFolder,
    createInteraction,
    getInteractionList,
    updateInteraction,
    deleteInteraction,
    createFlow,
    getFlows,
    updateFlow,
    removeFlow,
    createDefaultFlow,
    getInteractionDetails
}
