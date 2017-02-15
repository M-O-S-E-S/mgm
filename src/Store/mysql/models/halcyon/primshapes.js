/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('primshapes', {
    Shape: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    ScaleX: {
      type: 'DOUBLE',
      allowNull: false,
      defaultValue: '0'
    },
    ScaleY: {
      type: 'DOUBLE',
      allowNull: false,
      defaultValue: '0'
    },
    ScaleZ: {
      type: 'DOUBLE',
      allowNull: false,
      defaultValue: '0'
    },
    PCode: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    PathBegin: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    PathEnd: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    PathScaleX: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    PathScaleY: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    PathShearX: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    PathShearY: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    PathSkew: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    PathCurve: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    PathRadiusOffset: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    PathRevolutions: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    PathTaperX: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    PathTaperY: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    PathTwist: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    PathTwistBegin: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    ProfileBegin: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    ProfileEnd: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    ProfileCurve: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    ProfileHollow: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    State: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    Texture: {
      type: 'LONGBLOB',
      allowNull: true
    },
    ExtraParams: {
      type: 'LONGBLOB',
      allowNull: true
    },
    Media: {
      type: 'LONGBLOB',
      allowNull: true
    },
    Materials: {
      type: 'LONGBLOB',
      allowNull: true
    },
    UUID: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      defaultValue: '',
      primaryKey: true
    },
    PhysicsData: {
      type: 'BLOB',
      allowNull: true
    },
    PreferredPhysicsShape: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0'
    },
    VertexCount: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    HighLODBytes: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    MidLODBytes: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    LowLODBytes: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    LowestLODBytes: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    }
  }, {
    tableName: 'primshapes'
  });
};
