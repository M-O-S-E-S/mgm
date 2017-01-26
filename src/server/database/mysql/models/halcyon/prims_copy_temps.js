/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('prims_copy_temps', {
    CreationDate: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Text: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    SitName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    TouchName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ObjectFlags: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    OwnerMask: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    NextOwnerMask: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    GroupMask: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    EveryoneMask: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    BaseMask: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    PositionX: {
      type: 'DOUBLE',
      allowNull: true
    },
    PositionY: {
      type: 'DOUBLE',
      allowNull: true
    },
    PositionZ: {
      type: 'DOUBLE',
      allowNull: true
    },
    GroupPositionX: {
      type: 'DOUBLE',
      allowNull: true
    },
    GroupPositionY: {
      type: 'DOUBLE',
      allowNull: true
    },
    GroupPositionZ: {
      type: 'DOUBLE',
      allowNull: true
    },
    VelocityX: {
      type: 'DOUBLE',
      allowNull: true
    },
    VelocityY: {
      type: 'DOUBLE',
      allowNull: true
    },
    VelocityZ: {
      type: 'DOUBLE',
      allowNull: true
    },
    AngularVelocityX: {
      type: 'DOUBLE',
      allowNull: true
    },
    AngularVelocityY: {
      type: 'DOUBLE',
      allowNull: true
    },
    AngularVelocityZ: {
      type: 'DOUBLE',
      allowNull: true
    },
    AccelerationX: {
      type: 'DOUBLE',
      allowNull: true
    },
    AccelerationY: {
      type: 'DOUBLE',
      allowNull: true
    },
    AccelerationZ: {
      type: 'DOUBLE',
      allowNull: true
    },
    RotationX: {
      type: 'DOUBLE',
      allowNull: true
    },
    RotationY: {
      type: 'DOUBLE',
      allowNull: true
    },
    RotationZ: {
      type: 'DOUBLE',
      allowNull: true
    },
    RotationW: {
      type: 'DOUBLE',
      allowNull: true
    },
    SitTargetOffsetX: {
      type: 'DOUBLE',
      allowNull: true
    },
    SitTargetOffsetY: {
      type: 'DOUBLE',
      allowNull: true
    },
    SitTargetOffsetZ: {
      type: 'DOUBLE',
      allowNull: true
    },
    SitTargetOrientW: {
      type: 'DOUBLE',
      allowNull: true
    },
    SitTargetOrientX: {
      type: 'DOUBLE',
      allowNull: true
    },
    SitTargetOrientY: {
      type: 'DOUBLE',
      allowNull: true
    },
    SitTargetOrientZ: {
      type: 'DOUBLE',
      allowNull: true
    },
    OldUUID: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '',
      primaryKey: true
    },
    NewUUID: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: ''
    },
    RegionUUID: {
      type: DataTypes.CHAR(36),
      allowNull: true
    },
    CreatorID: {
      type: DataTypes.CHAR(36),
      allowNull: true
    },
    OwnerID: {
      type: DataTypes.CHAR(36),
      allowNull: true
    },
    GroupID: {
      type: DataTypes.CHAR(36),
      allowNull: true
    },
    LastOwnerID: {
      type: DataTypes.CHAR(36),
      allowNull: true
    },
    SceneGroupID: {
      type: DataTypes.CHAR(36),
      allowNull: true
    },
    PayPrice: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    PayButton1: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    PayButton2: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    PayButton3: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    PayButton4: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    LoopedSound: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    LoopedSoundGain: {
      type: 'DOUBLE',
      allowNull: false,
      defaultValue: '0'
    },
    TextureAnimation: {
      type: 'BLOB',
      allowNull: true
    },
    OmegaX: {
      type: 'DOUBLE',
      allowNull: false,
      defaultValue: '0'
    },
    OmegaY: {
      type: 'DOUBLE',
      allowNull: false,
      defaultValue: '0'
    },
    OmegaZ: {
      type: 'DOUBLE',
      allowNull: false,
      defaultValue: '0'
    },
    CameraEyeOffsetX: {
      type: 'DOUBLE',
      allowNull: false,
      defaultValue: '0'
    },
    CameraEyeOffsetY: {
      type: 'DOUBLE',
      allowNull: false,
      defaultValue: '0'
    },
    CameraEyeOffsetZ: {
      type: 'DOUBLE',
      allowNull: false,
      defaultValue: '0'
    },
    CameraAtOffsetX: {
      type: 'DOUBLE',
      allowNull: false,
      defaultValue: '0'
    },
    CameraAtOffsetY: {
      type: 'DOUBLE',
      allowNull: false,
      defaultValue: '0'
    },
    CameraAtOffsetZ: {
      type: 'DOUBLE',
      allowNull: false,
      defaultValue: '0'
    },
    ForceMouselook: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0'
    },
    ScriptAccessPin: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    AllowedDrop: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0'
    },
    DieAtEdge: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0'
    },
    SalePrice: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '10'
    },
    SaleType: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0'
    },
    ColorR: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    ColorG: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    ColorB: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    ColorA: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    ParticleSystem: {
      type: 'BLOB',
      allowNull: true
    },
    ClickAction: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0'
    },
    Material: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '3'
    },
    CollisionSound: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '00000000-0000-0000-0000-000000000000'
    },
    CollisionSoundVolume: {
      type: 'DOUBLE',
      allowNull: false,
      defaultValue: '0'
    },
    LinkNumber: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    }
  }, {
    tableName: 'prims_copy_temps'
  });
};
