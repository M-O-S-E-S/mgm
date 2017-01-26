/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('regionsettings', {
    regionUUID: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      primaryKey: true
    },
    block_terraform: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    block_fly: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    allow_damage: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    restrict_pushing: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    allow_land_resell: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    allow_land_join_divide: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    block_show_in_search: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    agent_limit: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    object_bonus: {
      type: 'DOUBLE',
      allowNull: false
    },
    maturity: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    disable_scripts: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    disable_collisions: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    disable_physics: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    terrain_texture_1: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    terrain_texture_2: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    terrain_texture_3: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    terrain_texture_4: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    elevation_1_nw: {
      type: 'DOUBLE',
      allowNull: false
    },
    elevation_2_nw: {
      type: 'DOUBLE',
      allowNull: false
    },
    elevation_1_ne: {
      type: 'DOUBLE',
      allowNull: false
    },
    elevation_2_ne: {
      type: 'DOUBLE',
      allowNull: false
    },
    elevation_1_se: {
      type: 'DOUBLE',
      allowNull: false
    },
    elevation_2_se: {
      type: 'DOUBLE',
      allowNull: false
    },
    elevation_1_sw: {
      type: 'DOUBLE',
      allowNull: false
    },
    elevation_2_sw: {
      type: 'DOUBLE',
      allowNull: false
    },
    water_height: {
      type: 'DOUBLE',
      allowNull: false
    },
    terrain_raise_limit: {
      type: 'DOUBLE',
      allowNull: false
    },
    terrain_lower_limit: {
      type: 'DOUBLE',
      allowNull: false
    },
    use_estate_sun: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    fixed_sun: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    sun_position: {
      type: 'DOUBLE',
      allowNull: false
    },
    covenant: {
      type: DataTypes.CHAR(36),
      allowNull: true
    },
    Sandbox: {
      type: DataTypes.INTEGER(4),
      allowNull: false
    },
    sunvectorx: {
      type: 'DOUBLE',
      allowNull: false,
      defaultValue: '0'
    },
    sunvectory: {
      type: 'DOUBLE',
      allowNull: false,
      defaultValue: '0'
    },
    sunvectorz: {
      type: 'DOUBLE',
      allowNull: false,
      defaultValue: '0'
    },
    covenantTimeStamp: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '1262307600'
    }
  }, {
    tableName: 'regionsettings'
  });
};
