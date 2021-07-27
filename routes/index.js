var express = require('express');
var router = express.Router();
var FormData = require('form-data');
const algoliasearch = require("algoliasearch");
var unirest = require('unirest');
var cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: 'dqyj1ilsr',
  api_key: '657113948944339',
  api_secret: '3LlhAX7HUzNMJXNYuiBUvqY8pQE',
  secure: true
});
ALGOLIA = {
  applicationId: 'F1JJ431PPV', searchKey: '27cf7123ef9029f73dff430588b72bc7',
  adminKey: '00f5bf464225cf894df7ae5ea091b2c5'
}

client = algoliasearch(ALGOLIA.applicationId, ALGOLIA.searchKey);
categoryTableSearch = client.initIndex('category');
productTableSearch = client.initIndex('products');
admin = algoliasearch(ALGOLIA.applicationId, ALGOLIA.adminKey);
categoryTableManagement = admin.initIndex('category');
productTableManagement = admin.initIndex('products');


/* GET home page. */
router.get('/', function (req, res, next) {
  res.send("successs");
});

router.post('/get_item', function (req, res, next) {
  var Msg = {};
  try {
    var DynamicIndex = req.body.type && req.body.type == 'category'?categoryTableSearch:productTableSearch
    DynamicIndex.getObject(req.body.objectID).then((result) => {
      Msg = {
        success: true,
        data: result,
        code: 200
      }
      res.send(Msg);
    });
  } catch (err) {
    Msg = {
      success: false,
      data: [],
      code: 400
    }
    res.send(Msg);
  }

});
router.post('/get_items', function (req, res, next) {
  var Msg = {};
  try {
    var DynamicIndex = req.body.type && req.body.type == 'category'?categoryTableSearch:productTableSearch
    var filter = req.body.type == 'category' ? 'parent:root' : 'category:root'
    if(req.body.id){
      filter = req.body.type == 'category' && req.body.id ? 'parent:'+req.body.id : 'category:'+req.body.id
    }
    if(req.body.list){
      filter = '';
    }
    console.log("req.body",req.body)
    console.log("filter",filter)
    DynamicIndex.search('',{
      filters: filter
    }).then((result) => {

      console.log("result",result)
      Msg = {
        success: result.hits && result.hits.length ? true : false,
        data: result,
        code: 200
      }
      res.send(Msg);
    });
  } catch (err) {
    Msg = {
      success: false,
      data: [],
      code: 400
    }
    res.send(Msg);
  }
});

router.post('/delete_item', function (req, res, next) {
  var Msg = {};
  try {
    var DynamicIndex = req.body.type && req.body.type == 'category'?categoryTableManagement:productTableManagement
    DynamicIndex.deleteObject(req.body.objectID).then((result) => {
      console.log(result);
      if (result) {
        Msg = {
          success: true,
          data: result,
          code: 200
        }
      } else {
        Msg = {
          success: false,
          data: result,
          code: 400
        }
      }
      res.send(Msg);
    });
  } catch (err) {
    Msg = {
      success: false,
      data: [],
      code: 400
    }
    res.send(Msg);
  }
});

router.post('/update_item', function (req, res, next) {
  var Msg = {};
  try {
    if (req.body.Image) {
      var Image = req.body.Image
      cloudinary.uploader.upload(Image, function (error, result) {
        console.log(result);
        console.log(error)
        if (error) {
          Msg = {
            success: false,
            data: error,
            code: 400
          }
        }
        if (result && result.url) {
          req.body.Image = result.url
          saveItems(req.body, (result) => {
            res.send(result);
          })
        }
      });
    } else {
      req.body.Image = req.body.UploadedImage;
      saveItems(req.body, (result) => {
        res.send(result);
      })
    }

  } catch (err) {
    Msg = {
      success: false,
      data: [],
      code: 400
    }
    res.send(Msg);
  }
});


function saveItems(params, callback) {
  console.log("saveItems:");
  var Msg = {};
  try {
    var DynamicIndex = params.type && params.type == 'category'?categoryTableManagement:productTableManagement
      DynamicIndex.saveObjects([params], {autoGenerateObjectIDIfNotExist: params.objectID ? false : true}).then(({objectIDs}) => {
      if (objectIDs) {
        Msg = {
          success: true,
          data: objectIDs,
          code: 200
        }
      } else {
        Msg = {
          success: false,
          data: [],
          code: 400
        }
      }
      callback(Msg)
    });
  } catch (err) {
    Msg = {
      success: false,
      data: err,
      code: 400
    }
    callback(Msg)
  }
}

module.exports = router;
