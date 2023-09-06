<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.slider { /*blue box*/
  position: absolute;
  cursor: pointer;
  inset: 0 0 0 0;
  background-color: #ccc;
  -webkit-transition: .4s;
  transition: 0.6s;
}

.slider:before { /*the square*/
  position: absolute;
  content: "";
  height: 72%;
  width: 42%;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

</style>
</head>
<body>

<label class="switch">
  <input type="checkbox">
  <span class="slider"></span>
</label>

<label class="switch">
  <input type="checkbox" checked>
  <span class="slider"></span>
</label>

</body>
</html> 
