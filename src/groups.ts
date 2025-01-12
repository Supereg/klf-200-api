import { Component } from "./utils/PropertyChangedEvent";
import { IConnection } from "./connection";
import { GW_GET_GROUP_INFORMATION_NTF } from "./KLF200-API/GW_GET_GROUP_INFORMATION_NTF";
import { GW_GET_ALL_GROUPS_INFORMATION_NTF } from "./KLF200-API/GW_GET_ALL_GROUPS_INFORMATION_NTF";
import { Velocity, NodeVariation, ActuatorType } from "./KLF200-API/GW_SYSTEMTABLE_DATA";
import { GroupType } from "./KLF200-API/GW_GROUPS";
import { isArrayEqual } from "./utils/UtilityFunctions";
import { GW_SET_GROUP_INFORMATION_CFM } from "./KLF200-API/GW_SET_GROUP_INFORMATION_CFM";
import { GW_SET_GROUP_INFORMATION_REQ } from "./KLF200-API/GW_SET_GROUP_INFORMATION_REQ";
import { GW_COMMON_STATUS, GatewayCommand, IGW_FRAME_RCV } from "./KLF200-API/common";
import { TypedEvent, Listener, Disposable } from "./utils/TypedEvent";
import { GW_GET_ALL_GROUPS_INFORMATION_FINISHED_NTF } from "./KLF200-API/GW_GET_ALL_GROUPS_INFORMATION_FINISHED_NTF";
import { GW_GET_ALL_GROUPS_INFORMATION_REQ } from "./KLF200-API/GW_GET_ALL_GROUPS_INFORMATION_REQ";
import { GW_GROUP_INFORMATION_CHANGED_NTF, ChangeType, GW_GROUP_INFORMATION_CHANGED_NTF_Modified } from "./KLF200-API/GW_GROUP_INFORMATION_CHANGED_NTF";
import { GW_ACTIVATE_PRODUCTGROUP_CFM } from "./KLF200-API/GW_ACTIVATE_PRODUCTGROUP_CFM";
import { GW_ACTIVATE_PRODUCTGROUP_REQ } from "./KLF200-API/GW_ACTIVATE_PRODUCTGROUP_REQ";
import { convertPosition, ActivateProductGroupStatus, CommandOriginator, PriorityLevel, ParameterActive, PriorityLevelLock, PriorityLevelInformation } from "./KLF200-API/GW_COMMAND";
import { GW_GET_NODE_INFORMATION_CFM } from "./KLF200-API/GW_GET_NODE_INFORMATION_CFM";
import { GW_GET_NODE_INFORMATION_REQ } from "./KLF200-API/GW_GET_NODE_INFORMATION_REQ";
import { GW_GET_NODE_INFORMATION_NTF } from "./KLF200-API/GW_GET_NODE_INFORMATION_NTF";
import { GW_GET_ALL_GROUPS_INFORMATION_CFM } from "./KLF200-API/GW_GET_ALL_GROUPS_INFORMATION_CFM";
import { GW_GET_GROUP_INFORMATION_CFM } from "./KLF200-API/GW_GET_GROUP_INFORMATION_CFM";
import { GW_GET_GROUP_INFORMATION_REQ } from "./KLF200-API/GW_GET_GROUP_INFORMATION_REQ";

"use strict";

/**
 * The gateway can hold up to 100 groups. A group is a collection of actuator nodes in
conjunction with a name and some other come characteristics.

There are three different group types. House, Room and User defined. There can be only
one instance of the group type house. The GroupID = 0 is reserved for the house group.
An actuator can only be represented in one room group. So, if an actuator is assigned to
a room group it will automatically be removed from another existing room group.
 *
 * @export
 * @class Group
 * @extends {Component}
 */
export class Group extends Component {
    /**
     * ID of the group.
     *
     * @type {number}
     * @memberof Group
     */
    public readonly GroupID: number;
    private _order: number;
    private _placement: number;
    private _name: string;
    private _velocity: Velocity;
    private _nodeVariation: NodeVariation;
    private _groupType: GroupType;

    /**
     * List of node IDs which are part of the group.
     *
     * @type {number[]}
     * @memberof Group
     */
    private readonly _Nodes: number[] = [];
    public get Nodes(): number[] {
        return this._Nodes;
    }
    private _revision: number;

    /**
     * Creates an instance of Group based on the provided notification frame.
     * You shouldn't create groups by yourself but rather use the [[Groups]] class
     * to provide you with a list of all groups.
     * @param {IConnection} Connection The connection that will be used to send and receive commands.
     * @param {(GW_GET_GROUP_INFORMATION_NTF | GW_GET_ALL_GROUPS_INFORMATION_NTF | GW_GROUP_INFORMATION_CHANGED_NTF)} frame Notification frame that is used to set the properties of the Group class instance.
     * @memberof Group
     */
    constructor(readonly Connection: IConnection, frame: GW_GET_GROUP_INFORMATION_NTF | GW_GET_ALL_GROUPS_INFORMATION_NTF | GW_GROUP_INFORMATION_CHANGED_NTF_Modified) {
        super();

        this.GroupID = frame.GroupID;
        this._order = frame.Order;
        this._placement = frame.Placement;
        this._name = frame.Name;
        this._velocity = frame.Velocity;
        this._nodeVariation = frame.NodeVariation;
        this._groupType = frame.GroupType;
        this.Nodes.push(...frame.Nodes);
        this._revision = frame.Revision;

        this.Connection.on(frame => this.onNotificationHandler(frame), [
            GatewayCommand.GW_GET_GROUP_INFORMATION_NTF
        ]);
    }

    /**
     * This method fires PropertyChanged events based on the changes
     * in the frame provided by the parameter.
     * This method will be used internally and you shouldn't need to
     * use it on your own.
     *
     * @param {GW_GROUP_INFORMATION_CHANGED_NTF_Modified} frame Change notification frame to calculate the changes.
     * @memberof Group
     */
    public changeFromNotification(frame: GW_GROUP_INFORMATION_CHANGED_NTF_Modified): void {
        if (this._order !== frame.Order) {
            this._order = frame.Order;
            this.propertyChanged("Order");
        }
        if (this._placement !== frame.Placement) {
            this._placement = frame.Placement;
            this.propertyChanged("Placement");
        }
        if (this._name !== frame.Name) {
            this._name = frame.Name;
            this.propertyChanged("Name");
        }
        if (this._velocity !== frame.Velocity) {
            this._velocity = frame.Velocity;
            this.propertyChanged("Velocity");
        }
        if (this._nodeVariation !== frame.NodeVariation) {
            this._nodeVariation = frame.NodeVariation;
            this.propertyChanged("NodeVariation");
        }
        if (this._groupType !== frame.GroupType) {
            this._groupType = frame.GroupType;
            this.propertyChanged("GroupType");
        }
        if (!isArrayEqual(this.Nodes, frame.Nodes)) {
            this.Nodes.length = 0;  // Clear nodes array
            this.Nodes.push(...frame.Nodes);
            this.propertyChanged("Nodes");
        }
        this._revision = frame.Revision;
    }

    /**
     * The order in which the groups should be displayed by a client application.
     *
     * @readonly
     * @type {number}
     * @memberof Group
     */
    public get Order(): number { return this._order; }

    /**
     * The placement of the product. Either a house index or a room index number.
     *
     * @readonly
     * @type {number}
     * @memberof Group
     */
    public get Placement(): number { return this._placement; }

    /**
     * Name of the group.
     *
     * @readonly
     * @type {string}
     * @memberof Group
     */
    public get Name(): string { return this._name; }

    /**
     * The velocity at which the products of the group are operated at if possible.
     *
     * @readonly
     * @type {Velocity}
     * @memberof Group
     */
    public get Velocity(): Velocity { return this._velocity; }

    /**
     * Defines the variation of the group.
     *
     * @readonly
     * @type {NodeVariation}
     * @memberof Group
     */
    public get NodeVariation(): NodeVariation { return this._nodeVariation; }
    
    /**
     * Type of the group.
     * 
     * * House - The house group can't be changed and contains all node IDs.
     * * Room - Each product can only be in one room.
     * * User group - User groups can be defined freely.
     *
     * @readonly
     * @type {GroupType}
     * @memberof Group
     */
    public get GroupType(): GroupType { return this._groupType; }

    /**
     * Change properties of the group.
     * 
     * If there are no changes in the properties the method returns directly with a resolved promise.
     *
     * @param {number} order New value for the Order property.
     * @param {number} placement New value for the Placement property.
     * @param {string} name New value for the Name property.
     * @param {Velocity} velocity New value for the Velocity property.
     * @param {NodeVariation} nodeVariation New value for the NodeVariation property.
     * @param {number[]} nodes New list of nodes.
     * @returns {Promise<void>}
     * @memberof Group
     */
    public async changeGroupAsync(order: number, placement: number, name: string, velocity: Velocity, nodeVariation: NodeVariation, nodes: number[]): Promise<void> {
        try {
            const changedProperties: (keyof this)[] = [];
            if (order !== this._order) changedProperties.push("Order");
            if (placement !== this._placement) changedProperties.push("Placement");
            if (name !== this._name) changedProperties.push("Name");
            if (velocity !== this._velocity) changedProperties.push("Velocity");
            if (nodeVariation !== this._nodeVariation) changedProperties.push("NodeVariation");
            if (!isArrayEqual(nodes, this.Nodes)) changedProperties.push("Nodes");

            // If there are no changes in the properties return directly with a resolved promise.
            if (changedProperties.length === 0) return Promise.resolve();

            const confirmationFrame = <GW_SET_GROUP_INFORMATION_CFM> await this.Connection.sendFrameAsync(new GW_SET_GROUP_INFORMATION_REQ(this.GroupID, this._revision, name, this._groupType, nodes, order, placement, velocity, nodeVariation));
            if (confirmationFrame.Status === GW_COMMON_STATUS.SUCCESS) {
                return Promise.resolve();
            }
            else {
                return Promise.reject(new Error(confirmationFrame.getError()));
            }
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
     * Sets a new value for the order number of the group.
     *
     * @param {number} newOrder New value for the order property.
     * @returns {Promise<void>}
     * @memberof Group
     */
    public async setOrderAsync(newOrder: number): Promise<void> {
        return this.changeGroupAsync(newOrder, this._placement, this._name, this._velocity, this._nodeVariation, this.Nodes);
    }

    /**
     * Sets a new value for the placement of the group.
     *
     * @param {number} newPlacement New value for the placement property.
     * @returns {Promise<void>}
     * @memberof Group
     */
    public async setPlacementAsync(newPlacement: number): Promise<void> {
        return this.changeGroupAsync(this._order, newPlacement, this._name, this._velocity, this._nodeVariation, this.Nodes);
    }

    /**
     * Renames the group.
     *
     * @param {string} newName New name of the group.
     * @returns {Promise<void>}
     * @memberof Group
     */
    public async setNameAsync(newName: string): Promise<void> {
        return this.changeGroupAsync(this._order, this._placement, newName, this._velocity, this._nodeVariation, this.Nodes);
    }

    /**
     * Sets the velocity for the group.
     *
     * @param {Velocity} newVelocity New velocity value for the group.
     * @returns {Promise<void>}
     * @memberof Group
     */
    public async setVelocityAsync(newVelocity: Velocity): Promise<void> {
        return this.changeGroupAsync(this._order, this._placement, this._name, newVelocity, this._nodeVariation, this.Nodes);
    }

    /**
     * Sets the variation of the group to a new value.
     *
     * @param {NodeVariation} newNodeVariation New value for the variation of the group.
     * @returns {Promise<void>}
     * @memberof Group
     */
    public async setNodeVariationAsync(newNodeVariation: NodeVariation): Promise<void> {
        return this.changeGroupAsync(this._order, this._placement, this._name, this._velocity, newNodeVariation, this.Nodes);
    }

    /**
     * Sets the group to contain the provided list of node IDs in the group.
     *
     * @param {number[]} newNodes Array of new node IDs for the group.
     * @returns {Promise<void>}
     * @memberof Group
     */
    public async setNodesAsync(newNodes: number[]): Promise<void> {
        return this.changeGroupAsync(this._order, this._placement, this._name, this._velocity, this._nodeVariation, newNodes);
    }

    /**
     * Sets the target position for all products of the group as raw value.
     *
     * @param {number} newPositionRaw New target position value as raw value.
     * @param Velocity The velocity with which the scene will be run.
     * @param PriorityLevel The priority level for the run command.
     * @param CommandOriginator The command originator for the run command.
     * @param ParameterActive The parameter that should be set by this command. MP or FP1-FP16.
     * @param PriorityLevelLock Flag if the priority level lock should be used.
     * @param PriorityLevels Up to 8 priority levels.
     * @param LockTime Lock time for the priority levels in seconds (multiple of 30 or Infinity).
     * @returns {Promise<number>}
     * @memberof Group
     */
    public async setTargetPositionRawAsync(newPositionRaw: number, Velocity: Velocity = 0, PriorityLevel: PriorityLevel = 3, CommandOriginator: CommandOriginator = 1, ParameterActive: ParameterActive = 0, PriorityLevelLock: PriorityLevelLock = 0, PriorityLevels: PriorityLevelInformation[] = [], LockTime: number = Infinity): Promise<number> {
        try {
            const confirmationFrame = <GW_ACTIVATE_PRODUCTGROUP_CFM> await this.Connection.sendFrameAsync(new GW_ACTIVATE_PRODUCTGROUP_REQ(this.GroupID, newPositionRaw, PriorityLevel, CommandOriginator, ParameterActive, Velocity, PriorityLevelLock, PriorityLevels, LockTime));
            if (confirmationFrame.Status === ActivateProductGroupStatus.OK) {
                return confirmationFrame.SessionID;
            }
            else {
                return Promise.reject(new Error(confirmationFrame.getError()));
            }
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
     * Sets the target position for all products of the group
     *
     * @param {number} newPosition New target position value in percent.
     * @param Velocity The velocity with which the scene will be run.
     * @param PriorityLevel The priority level for the run command.
     * @param CommandOriginator The command originator for the run command.
     * @param ParameterActive The parameter that should be set by this command. MP or FP1-FP16.
     * @param PriorityLevelLock Flag if the priority level lock should be used.
     * @param PriorityLevels Up to 8 priority levels.
     * @param LockTime Lock time for the priority levels in seconds (multiple of 30 or Infinity).
     * @returns {Promise<number>}
     * @memberof Group
     */
    public async setTargetPositionAsync(newPosition: number, Velocity: Velocity = 0, PriorityLevel: PriorityLevel = 3, CommandOriginator: CommandOriginator = 1, ParameterActive: ParameterActive = 0, PriorityLevelLock: PriorityLevelLock = 0, PriorityLevels: PriorityLevelInformation[] = [], LockTime: number = Infinity): Promise<number> {
        try {
            // Get product type from first node ID for conversion
            const nodeID = this.Nodes[0];

            // Setup notification to receive notification with actuator type
            let dispose: Disposable | undefined;
            const nodeTypeID = new Promise<ActuatorType>((resolve, reject) => {
                try{
                    let nodeTypeID: ActuatorType;

                    // Register notification handler
                    dispose = this.Connection.on(frame => {
                        try {
                            if (frame instanceof GW_GET_NODE_INFORMATION_NTF && frame.NodeID === nodeID) {
                                nodeTypeID = frame.ActuatorType;
                                if (dispose) {
                                    dispose.dispose();
                                }
                                resolve(nodeTypeID);
                            }
                        } catch (error) {
                            if (dispose) {
                                dispose.dispose();
                            }
                            reject(error);
                        }
                    }, [GatewayCommand.GW_GET_NODE_INFORMATION_NTF]);
                } catch (error) {
                    if (dispose) {
                        dispose.dispose();
                    }
                    reject(error);
                }
            });

            try
            {
                const productInformation = <GW_GET_NODE_INFORMATION_CFM> await this.Connection.sendFrameAsync(new GW_GET_NODE_INFORMATION_REQ(nodeID));
                if (productInformation.Status !== GW_COMMON_STATUS.SUCCESS) {
                    if (dispose) {
                        dispose.dispose();
                    }
                    return Promise.reject(new Error(productInformation.getError()));
                }
            } catch (error) {
                if (dispose) {
                    dispose.dispose();
                }
                return Promise.reject(error);
            }

            return this.setTargetPositionRawAsync(convertPosition(newPosition, await nodeTypeID), Velocity, PriorityLevel, CommandOriginator, ParameterActive, PriorityLevelLock, PriorityLevels, LockTime);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
     * Refresh the data of this group and read the attributes from the gateway.
     * 
     * You can use this method to refresh the state of the group in case
     * that you have missed changes, e.g. a simple remote control may change
     * the state of the group and you won't receive an event for it.
     * 
     * @returns {Promise<void>}
     * @memberof Group
     */
     public async refreshAsync(): Promise<void> {
        try {
            const confirmationFrame = <GW_GET_GROUP_INFORMATION_CFM> await this.Connection.sendFrameAsync(new GW_GET_GROUP_INFORMATION_REQ(this.GroupID));
            if (confirmationFrame.Status === GW_COMMON_STATUS.SUCCESS) {
                return Promise.resolve();
            }
            else {
                return Promise.reject(new Error(confirmationFrame.getError()));
            }
        } catch (error) {
            return Promise.reject(error);
        }
    }

    private onNotificationHandler(frame: IGW_FRAME_RCV): void {
        if (typeof this === "undefined")
            return;

        if (frame instanceof GW_GET_GROUP_INFORMATION_NTF) {
            this.onGetGroupInformation(frame);
        }
    }

    private onGetGroupInformation(frame: GW_GET_GROUP_INFORMATION_NTF): void {
        if (frame.GroupID === this.GroupID) {
            if (frame.Order !== this._order) {
                this._order = frame.Order;
                this.propertyChanged("Order");
            }
            if (frame.Placement !== this._placement) {
                this._placement = frame.Placement;
                this.propertyChanged("Placement");
            }
            if (frame.Name !== this._name) {
                this._name = frame.Name;
                this.propertyChanged("Name");
            }
            if (frame.Velocity !== this._velocity) {
                this._velocity = frame.Velocity;
                this.propertyChanged("Velocity");
            }
            if (frame.NodeVariation !== this._nodeVariation) {
                this._nodeVariation = frame.NodeVariation;
                this.propertyChanged("NodeVariation");
            }
            if (frame.GroupType !== this._groupType) {
                this._groupType = frame.GroupType;
                this.propertyChanged("GroupType");
            }
            const hasRemovedNodes = this.Nodes.every(item => frame.Nodes.includes(item));
            const hasNewNodes = frame.Nodes.every(item => this.Nodes.includes(item));
            if (hasRemovedNodes || hasNewNodes) {
                this.Nodes.length = 0;
                this.Nodes.push(...frame.Nodes);
                this.propertyChanged("Nodes");
            }
            this._revision = frame.Revision;
        }
    }
}

/**
 * The Groups class represent all groups defined in the KLF-200.
 *
 * @export
 * @class Groups
 */
export class Groups {
    private _onChangedGroup = new TypedEvent<number>();
    private _onRemovedGroup = new TypedEvent<number>();

    /**
     * Contains a list of groups.
     * The index of each group corresponds to the
     * group ID.
     *
     * @type {Group[]}
     * @memberof Groups
     */
    public readonly Groups: Group[] = [];

    private constructor(readonly Connection: IConnection) {}

    private async initializeGroupsAsync(): Promise<void> {
        // Setup notification to receive notification with actuator type
        let dispose: Disposable | undefined;

        try {
            const notificationHandler = new Promise<void>((resolve, reject) => {
                try {
                    dispose = this.Connection.on(frame => {
                        if (frame instanceof GW_GET_ALL_GROUPS_INFORMATION_NTF || frame instanceof GW_GET_GROUP_INFORMATION_NTF) {
                            this.Groups[frame.GroupID] = new Group(this.Connection, frame);
                        }
                        else if (frame instanceof GW_GET_ALL_GROUPS_INFORMATION_FINISHED_NTF) {
                            if (dispose) {
                                dispose.dispose();
                            }
                            this.Connection.on(frame => this.onNotificationHandler(frame), [GatewayCommand.GW_GROUP_INFORMATION_CHANGED_NTF]);
                            resolve();
                        }
                    }, [GatewayCommand.GW_GET_ALL_GROUPS_INFORMATION_NTF, GatewayCommand.GW_GET_ALL_GROUPS_INFORMATION_FINISHED_NTF, GatewayCommand.GW_GET_GROUP_INFORMATION_NTF]);
                } catch (error) {
                    if (dispose) {
                        dispose.dispose();
                    }
                    reject(error);
                }
            });

            const getAllGroupsInformation = <GW_GET_ALL_GROUPS_INFORMATION_CFM> await this.Connection.sendFrameAsync(new GW_GET_ALL_GROUPS_INFORMATION_REQ());
            if (getAllGroupsInformation.Status !== GW_COMMON_STATUS.SUCCESS) {
                if (dispose) {
                    dispose.dispose();
                }
                return Promise.reject(new Error(getAllGroupsInformation.getError()));
            }

            // Only wait for notifications if there are groups defined
            if (getAllGroupsInformation.NumberOfGroups > 0) {
                await notificationHandler;
            } else {
                if (dispose) {
                    dispose.dispose();
                }
            }
        } catch (error) {
            if (dispose) {
                dispose.dispose();
            }
            return Promise.reject(error);
        }
    }

    /**
     * Adds a handler that will be called if a new group is added to the KLF-200 interface or a group has been changed.
     *
     * @param {Listener<number>} handler Event handler that is called if a new group is added or a group has been changed.
     * @returns {Disposable} The event handler can be removed by using the dispose method of the returned object.
     * @memberof Groups
     */
    public onChangedGroup(handler: Listener<number>): Disposable {
        return this._onChangedGroup.on(handler);
    }

    /**
     * Adds a handler that will be called if a group is removed from the KLF-200 interface.
     *
     * @param {Listener<number>} handler Event handler that is called if a group is removed.
     * @returns {Disposable} The event handler can be removed by using the dispose method of the returned object.
     * @memberof Groups
     */
    public onRemovedGroup(handler: Listener<number>): Disposable {
        return this._onRemovedGroup.on(handler);
    }

    private notifyChangedGroup(groupId: number): void {
        this._onChangedGroup.emit(groupId);
    }

    private notifyRemovedGroup(groupId: number): void {
        this._onRemovedGroup.emit(groupId);
    }

    private onNotificationHandler(frame: IGW_FRAME_RCV): void {
        if (frame instanceof GW_GROUP_INFORMATION_CHANGED_NTF) {
            switch (frame.ChangeType) {
                case ChangeType.Deleted:
                    // Remove group
                    delete this.Groups[frame.GroupID];
                    this.notifyRemovedGroup(frame.GroupID);
                    break;

                case ChangeType.Modified:
                    // Add or change group
                    if (typeof this.Groups[frame.GroupID] === "undefined") {
                        // Add node
                        this.Groups[frame.GroupID] = new Group(this.Connection, frame as GW_GROUP_INFORMATION_CHANGED_NTF_Modified);
                    }
                    else {
                        // Change group
                        this.Groups[frame.GroupID].changeFromNotification(frame as GW_GROUP_INFORMATION_CHANGED_NTF_Modified);
                    }
                    this.notifyChangedGroup(frame.GroupID);
            
                default:
                    break;
            }
        }
    }

    /**
     * Creates a new instance of the Groups class.
     * During the initialization phase of the class
     * a list of all groups will be retrieved from
     * the KLF-200 interface and stored at the
     * Groups array.
     * 
     * Additionally, some notification handlers
     * will be instantiated to watch for changes
     * to the groups.
     *
     * @static
     * @param {IConnection} Connection The connection object that handles the communication to the KLF interface.
     * @returns {Promise<Groups>} Resolves to a new instance of the Groups class.
     * @memberof Groups
     */
    static async createGroupsAsync(Connection: IConnection): Promise<Groups> {
        try {
            const result = new Groups(Connection);
            await result.initializeGroupsAsync();
            return result;
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
     * Finds a group by its name and returns the group object.
     *
     * @param {string} groupName The name of the group.
     * @returns {(Group | undefined)} Returns the group object if found, otherwise undefined.
     * @memberof Groups
     */
    public findByName(groupName: string): Group | undefined {
        return this.Groups.find(grp => typeof grp !== "undefined" && grp.Name === groupName);
    }
}